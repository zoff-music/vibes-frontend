import { createContext, type PropsWithChildren, useContext } from 'react';
import { Platform, View, type ViewProps } from 'react-native';
import {
  type Edge,
  type EdgeInsets,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

const WindowInsetsContext = createContext<EdgeInsets | null>(null);

export function ScreenInsetsProvider({ children }: PropsWithChildren) {
  const insets = useSafeAreaInsets();
  return <WindowInsetsContext value={insets}>{children}</WindowInsetsContext>;
}

interface ScreenSafeAreaProps extends ViewProps {
  edges?: readonly Edge[];
  pageSheet?: boolean;
}

export function ScreenSafeArea({
  edges = allEdges,
  pageSheet = false,
  style,
  ...props
}: ScreenSafeAreaProps) {
  const localInsets = useSafeAreaInsets();
  const windowInsets = useContext(WindowInsetsContext);
  const insets = pageSheet ? localInsets : (windowInsets ?? localInsets);

  // Full-screen tabs use the window inset, not a per-tab provider which may
  // briefly report zero while its native screen attaches. Sheets stay local.
  return (
    <View
      {...props}
      style={[
        style,
        {
          paddingTop:
            edges.includes('top') && !(pageSheet && Platform.OS === 'ios')
              ? insets.top
              : 0,
          paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
          paddingLeft: edges.includes('left') ? insets.left : 0,
          paddingRight: edges.includes('right') ? insets.right : 0,
        },
      ]}
    />
  );
}

const allEdges: readonly Edge[] = ['top', 'bottom', 'left', 'right'];
