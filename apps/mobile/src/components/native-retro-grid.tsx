import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  type SharedValue,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Line } from 'react-native-svg';
import { useGenerativeMotion } from '@/hooks/use-generative-motion';

interface NativeRetroGridProps {
  paused?: boolean;
}
interface GridRowProps {
  index: number;
  phase: SharedValue<number>;
}
const AnimatedLine = Animated.createAnimatedComponent(Line);
const rows = Array.from({ length: 16 }, (_, index) => index);
const columns = Array.from({ length: 41 }, (_, index) => index);

function GridRow({ index, phase }: GridRowProps) {
  const animatedProps = useAnimatedProps(() => {
    const depth = ((index + phase.value) % rows.length) / rows.length;
    const y = 1000 * depth * depth;
    return {
      y1: y,
      y2: y,
      opacity: Math.min(depth * 4, 1) * Math.min((1 - depth) * 16, 1),
    };
  });
  return (
    <AnimatedLine
      x1={0}
      x2={1000}
      stroke="#00cdea"
      strokeWidth={1}
      animatedProps={animatedProps}
    />
  );
}

export function NativeRetroGrid({ paused = false }: NativeRetroGridProps) {
  const motion = useGenerativeMotion();
  const phase = useSharedValue(0);
  useEffect(() => {
    cancelAnimation(phase);
    if (!paused && motion) {
      phase.value = withRepeat(
        withTiming(phase.value + 16, {
          duration: 32000,
          easing: Easing.linear,
        }),
        -1,
        false,
      );
    }
    return () => cancelAnimation(phase);
  }, [motion, paused, phase]);
  return (
    <View
      className="absolute inset-0 overflow-hidden opacity-15"
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
      >
        {columns.map((index) => (
          <Line
            key={index}
            x1={500 + (index - 20) * 40}
            y1={0}
            x2={500 + (index - 20) * 150}
            y2={1000}
            stroke="#ff28a0"
            strokeWidth={1}
          />
        ))}
        {rows.map((index) => (
          <GridRow key={index} index={index} phase={phase} />
        ))}
      </Svg>
    </View>
  );
}
