import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useAppTheme } from '@/hooks/use-app-theme';

export function AnimatedLogo() {
  const theme = useAppTheme();
  const reduceMotion = useReducedMotion();
  const cyanPhase = useSharedValue(0);
  const pinkPhase = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      cyanPhase.value = 0;
      pinkPhase.value = 0;
      return;
    }

    cyanPhase.value = withRepeat(
      withSequence(
        withTiming(1, glitchTiming),
        withTiming(0.25, glitchTiming),
        withTiming(0.8, glitchTiming),
        withTiming(0, glitchTiming),
        withDelay(glitchRestDuration, withTiming(0, glitchTiming)),
      ),
      -1,
    );
    pinkPhase.value = withDelay(
      glitchOffsetDuration,
      withRepeat(
        withSequence(
          withTiming(0.75, glitchTiming),
          withTiming(0.15, glitchTiming),
          withTiming(1, glitchTiming),
          withTiming(0, glitchTiming),
          withDelay(glitchRestDuration, withTiming(0, glitchTiming)),
        ),
        -1,
      ),
    );

    return () => {
      cancelAnimation(cyanPhase);
      cancelAnimation(pinkPhase);
    };
  }, [cyanPhase, pinkPhase, reduceMotion]);

  const cyanStyle = useAnimatedStyle(() => ({
    opacity: interpolate(cyanPhase.value, [0, 1], [0.45, 0.9]),
    transform: [
      { translateX: interpolate(cyanPhase.value, [0, 1], [2, 7]) },
      { translateY: interpolate(cyanPhase.value, [0, 1], [1, -2]) },
    ],
  }));
  const pinkStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pinkPhase.value, [0, 1], [0.5, 0.9]),
    transform: [
      { translateX: interpolate(pinkPhase.value, [0, 1], [-2, -7]) },
      { translateY: interpolate(pinkPhase.value, [0, 1], [-1, 2]) },
    ],
  }));

  return (
    <View
      accessibilityLabel="Zoff"
      accessibilityRole="header"
      style={styles.container}
    >
      <Animated.Text
        accessible={false}
        style={[styles.text, { color: theme.accent }, cyanStyle]}
      >
        ゾフ
      </Animated.Text>
      <Animated.Text
        accessible={false}
        style={[styles.text, { color: theme.pink }, pinkStyle]}
      >
        ゾフ
      </Animated.Text>
      <Animated.Text
        accessible={false}
        style={[
          styles.text,
          styles.base,
          { color: theme.text, textShadowColor: theme.pink },
        ]}
      >
        ゾフ
      </Animated.Text>
    </View>
  );
}

const glitchTiming = { duration: 55, easing: Easing.linear };
const glitchOffsetDuration = 180;
const glitchRestDuration = 1_050;

const styles = StyleSheet.create({
  base: {
    textShadowOffset: { height: 0, width: 0 },
    textShadowRadius: 12,
  },
  container: {
    alignItems: 'center',
    height: 76,
    justifyContent: 'center',
    width: 150,
  },
  text: {
    fontFamily: 'Pixelify Sans Bold',
    fontSize: 52,
    letterSpacing: 3,
    lineHeight: 60,
    position: 'absolute',
  },
});
