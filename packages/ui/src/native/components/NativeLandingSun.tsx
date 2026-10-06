import { View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Mask,
  Rect,
  Stop,
} from 'react-native-svg';

interface NativeLandingSunProps {
  watch?: boolean;
}

export function NativeLandingSun({ watch = false }: NativeLandingSunProps) {
  return (
    <View
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      className="h-24 items-center overflow-hidden"
    >
      <View className="size-56 opacity-80">
        <Svg width="100%" height="100%" viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="landing-eclipse" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#d8bcff" />
              <Stop offset="0.5" stopColor="#00cdea" />
              <Stop offset="1" stopColor="#a74fe8" />
            </LinearGradient>
            <Mask
              id="landing-crescent"
              x="0"
              y="0"
              width="100"
              height="100"
              maskUnits="userSpaceOnUse"
            >
              <Circle cx="50" cy="50" r="50" fill="white" />
              <Circle cx="47" cy="54" r="47" fill="black" />
            </Mask>
            <LinearGradient id="landing-sunset" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#ffe8a3" />
              <Stop offset="0.24" stopColor="#ffb574" />
              <Stop offset="0.48" stopColor="#ff6b9b" />
              <Stop offset="0.7" stopColor="#f336a4" />
              <Stop offset="1" stopColor="#ac42d5" />
            </LinearGradient>
            <Mask
              id="landing-bands"
              x="0"
              y="0"
              width="100"
              height="100"
              maskUnits="userSpaceOnUse"
            >
              <Rect width="100" height="22" fill="white" />
              <Rect y="24" width="100" height="6" fill="white" />
              <Rect y="33" width="100" height="5" fill="white" />
              <Rect y="42" width="100" height="4" fill="white" />
            </Mask>
          </Defs>
          <Circle
            cx="50"
            cy="50"
            r="50"
            fill={watch ? 'url(#landing-eclipse)' : 'url(#landing-sunset)'}
            mask={watch ? 'url(#landing-crescent)' : 'url(#landing-bands)'}
          />
        </Svg>
      </View>
    </View>
  );
}
