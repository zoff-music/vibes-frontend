import { useEffect } from 'react';
import { View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import Animated, {
  cancelAnimation,
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface NativeAnimatedLogoProps {
  accentColor: string;
  baseColor: string;
  pinkColor: string;
}

export function NativeAnimatedLogo({
  accentColor,
  baseColor,
  pinkColor,
}: NativeAnimatedLogoProps) {
  const reduceMotion = useReducedMotion();
  const cyanJitterPhase = useSharedValue(0);
  const pinkJitterPhase = useSharedValue(0);
  const cyanSlicePhase = useSharedValue(0);
  const pinkSlicePhase = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      cyanJitterPhase.value = 0;
      pinkJitterPhase.value = 0;
      cyanSlicePhase.value = 0;
      pinkSlicePhase.value = 0;
      return;
    }

    cyanJitterPhase.value = withRepeat(
      withTiming(glitchPhaseCount, cyanGlitchTiming),
      -1,
    );
    pinkJitterPhase.value = withDelay(
      glitchOffsetDuration,
      withRepeat(withTiming(glitchPhaseCount, pinkGlitchTiming), -1),
    );
    cyanSlicePhase.value = withRepeat(
      withTiming(glitchPhaseCount, cyanSliceTiming),
      -1,
    );
    pinkSlicePhase.value = withRepeat(
      withTiming(glitchPhaseCount, pinkSliceTiming),
      -1,
    );
    return () => {
      cancelAnimation(cyanJitterPhase);
      cancelAnimation(pinkJitterPhase);
      cancelAnimation(cyanSlicePhase);
      cancelAnimation(pinkSlicePhase);
    };
  }, [
    cyanJitterPhase,
    cyanSlicePhase,
    pinkJitterPhase,
    pinkSlicePhase,
    reduceMotion,
  ]);

  const cyanJitterStyle = useAnimatedStyle(() => ({
    opacity: 0.85,
    transform: [
      {
        translateX: interpolate(
          cyanJitterPhase.value,
          glitchPhases,
          cyanOffsetsX,
          Extrapolation.CLAMP,
        ),
      },
      {
        translateY: interpolate(
          cyanJitterPhase.value,
          glitchPhases,
          cyanOffsetsY,
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));
  const pinkJitterStyle = useAnimatedStyle(() => ({
    opacity: 0.85,
    transform: [
      {
        translateX: interpolate(
          pinkJitterPhase.value,
          glitchPhases,
          pinkOffsetsX,
          Extrapolation.CLAMP,
        ),
      },
      {
        translateY: interpolate(
          pinkJitterPhase.value,
          glitchPhases,
          pinkOffsetsY,
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));
  const cyanSliceStyle = useSliceViewportStyle(cyanSlicePhase);
  const pinkSliceStyle = useSliceViewportStyle(pinkSlicePhase);
  const cyanSliceTextStyle = useSliceTextStyle(cyanSlicePhase);
  const pinkSliceTextStyle = useSliceTextStyle(pinkSlicePhase);

  return (
    <View
      accessibilityLabel="Zoff"
      accessibilityRole="header"
      className="h-19 w-37.5 items-center justify-center"
    >
      <Animated.View
        accessible={false}
        className="absolute w-37.5 overflow-hidden"
        style={cyanSliceStyle}
      >
        <Animated.Text
          className="absolute top-0 w-37.5 text-center font-heading text-[52px] leading-[60px] tracking-[3px]"
          style={[{ color: accentColor }, cyanSliceTextStyle, cyanJitterStyle]}
        >
          ゾフ
        </Animated.Text>
      </Animated.View>
      <Animated.View
        accessible={false}
        className="absolute w-37.5 overflow-hidden"
        style={pinkSliceStyle}
      >
        <Animated.Text
          className="absolute top-0 w-37.5 text-center font-heading text-[52px] leading-[60px] tracking-[3px]"
          style={[{ color: pinkColor }, pinkSliceTextStyle, pinkJitterStyle]}
        >
          ゾフ
        </Animated.Text>
      </Animated.View>
      <Animated.Text
        accessible={false}
        className="absolute top-2 w-37.5 text-center font-heading text-[52px] leading-[60px] tracking-[3px]"
        style={{
          color: baseColor,
          textShadowColor: pinkColor,
          textShadowOffset: { height: 0, width: 0 },
          textShadowRadius: 12,
        }}
      >
        ゾフ
      </Animated.Text>
    </View>
  );
}

function useSliceViewportStyle(phase: SharedValue<number>) {
  return useAnimatedStyle(() => {
    const sliceTop = interpolate(
      phase.value,
      sliceStepInputs,
      sliceTopSteps,
      Extrapolation.CLAMP,
    );

    return {
      height: interpolate(
        phase.value,
        sliceStepInputs,
        sliceHeightSteps,
        Extrapolation.CLAMP,
      ),
      top: logoTop + sliceTop,
    };
  });
}

function useSliceTextStyle(phase: SharedValue<number>) {
  return useAnimatedStyle(() => ({
    top: -interpolate(
      phase.value,
      sliceStepInputs,
      sliceTopSteps,
      Extrapolation.CLAMP,
    ),
  }));
}

const glitchPhases = [0, 1, 2, 3, 4, 5];
const cyanOffsetsX = [3, 2, 4, 1, 5, 3];
const cyanOffsetsY = [-2, -1, -3, -2, -1, -2];
const pinkOffsetsX = [-3, -5, -1, -4, -2, -3];
const pinkOffsetsY = [2, 3, 1, 2, 3, 2];
const sliceStepInputs = [
  0, 0.499, 0.5, 0.999, 1, 1.499, 1.5, 1.999, 2, 2.499, 2.5, 2.999, 3, 3.499,
  3.5, 3.999, 4, 4.499, 4.5, 4.999, 5,
];
const sliceTopSteps = [
  0, 0, 3, 3, 6, 6, 12, 12, 18, 18, 25.5, 25.5, 33, 33, 22.5, 22.5, 12, 12, 6,
  6, 0,
];
const sliceHeightSteps = [
  12, 12, 15, 15, 18, 18, 21, 21, 24, 24, 22.5, 22.5, 21, 21, 21, 21, 18, 18,
  15, 15, 12,
];
const glitchPhaseCount = 5;
const glitchOffsetDuration = 100;
const cyanGlitchTiming = { duration: 1_200, easing: Easing.linear };
const pinkGlitchTiming = { duration: 1_000, easing: Easing.linear };
const cyanSliceTiming = { duration: 2_200, easing: Easing.linear };
const pinkSliceTiming = { duration: 1_800, easing: Easing.linear };
const logoTop = 8;
