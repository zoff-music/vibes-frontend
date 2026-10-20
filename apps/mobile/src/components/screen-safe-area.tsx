import { Platform, View, type ViewProps } from 'react-native';
import { type Edge, useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();

  // Context starts with the root metrics, including preloaded native tabs.
  // Native SafeAreaView instead starts with zero padding until it attaches.
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
