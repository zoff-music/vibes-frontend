import {
  createContext,
  type PropsWithChildren,
  useContext,
  useState,
} from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKeyboardVisible } from '@/hooks/use-keyboard-visible';
import { useTabletLandscapeLayout } from '@/hooks/use-tablet-landscape-layout';
import { getPhoneNavigationGeometry } from '@/utils/phone-navigation-geometry';

interface NavigationGeometry {
  bottom: number;
  clearance: number | null;
  onLayout: (event: LayoutChangeEvent) => void;
}

const NavigationContext = createContext<NavigationGeometry | null>(null);

export function PhoneNavigationProvider({ children }: PropsWithChildren) {
  const insets = useSafeAreaInsets();
  const { isTablet } = useTabletLandscapeLayout();
  const keyboardVisible = useKeyboardVisible();
  const [height, setHeight] = useState(64);
  const geometry = getPhoneNavigationGeometry(insets.bottom, height);

  return (
    <NavigationContext
      value={{
        bottom: geometry.bottom,
        clearance: isTablet ? null : keyboardVisible ? 0 : geometry.clearance,
        onLayout: (event) => setHeight(event.nativeEvent.layout.height),
      }}
    >
      {children}
    </NavigationContext>
  );
}

export function usePhoneNavigationGeometry() {
  const geometry = useContext(NavigationContext);
  if (!geometry) throw new Error('Phone navigation provider is missing');
  return geometry;
}
