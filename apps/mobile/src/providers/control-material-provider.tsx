import { safeWrapAsync } from '@vibes/shared';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

const ControlMaterialContext = createContext(false);

export function ControlMaterialProvider({ children }: PropsWithChildren) {
  const [reducedTransparency, setReducedTransparency] = useState(true);
  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    let current = true;
    let revision = 0;
    const subscription = AccessibilityInfo.addEventListener(
      'reduceTransparencyChanged',
      (value) => {
        revision += 1;
        setReducedTransparency(value);
      },
    );
    const load = async () => {
      const [error, value] = await safeWrapAsync(
        AccessibilityInfo.isReduceTransparencyEnabled(),
      );
      if (current && revision === 0 && !error && value !== null)
        setReducedTransparency(value);
    };
    void load();
    return () => {
      current = false;
      subscription.remove();
    };
  }, []);
  const glass =
    Platform.OS === 'ios' && !reducedTransparency && isLiquidGlassAvailable();
  return (
    <ControlMaterialContext value={glass}>{children}</ControlMaterialContext>
  );
}

export function useControlMaterial() {
  return useContext(ControlMaterialContext);
}
