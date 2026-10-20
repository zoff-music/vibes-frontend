import { type ReactNode, useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Rect } from 'react-native-svg';
import { NativeGenerativeParticles } from './NativeGenerativeParticles';

interface Props {
  active: boolean;
  animate: boolean;
  children: ReactNode;
}

const AnimatedRect = Animated.createAnimatedComponent(Rect);

export function NativeGenerativeFrame({ active, animate, children }: Props) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const power = useSharedValue(0);
  const orbit = useSharedValue(0);
  const ignition = useSharedValue(1);
  const perimeter = 2 * (size.width + size.height - 8) - 27;

  useEffect(() => {
    power.value = animate
      ? withTiming(active ? 1 : 0, { duration: 350 })
      : active
        ? 1
        : 0;
    cancelAnimation(orbit);
    cancelAnimation(ignition);
    ignition.value = 1;
    if (active && animate) {
      ignition.value = 0;
      ignition.value = withTiming(1, {
        duration: 1100,
        easing: Easing.out(Easing.cubic),
      });
      orbit.value = 0;
      orbit.value = withRepeat(
        withTiming(1, { duration: 3800, easing: Easing.linear }),
        -1,
        false,
      );
    }
    return () => {
      cancelAnimation(power);
      cancelAnimation(orbit);
      cancelAnimation(ignition);
    };
  }, [active, animate, orbit, power, ignition]);

  const glow = useAnimatedStyle(() => ({ opacity: power.value }));
  const flare = useAnimatedStyle(() => ({
    opacity:
      power.value * interpolate(ignition.value, [0, 0.2, 1], [0.2, 1, 0.45]),
    transform: [
      { scaleX: interpolate(ignition.value, [0, 1], [0.88, 1]) },
      { scaleY: interpolate(ignition.value, [0, 0.25, 1], [1, 1.18, 1]) },
    ],
  }));
  const sweep = useAnimatedStyle(() => ({
    opacity:
      power.value *
      interpolate(ignition.value, [0, 0.15, 0.8, 1], [0, 0.8, 0.5, 0]),
    transform: [{ translateX: -ignition.value * size.width }],
  }));
  const cyan = useAnimatedProps(() => ({
    strokeDashoffset: -orbit.value * perimeter,
  }));
  const pink = useAnimatedProps(() => ({
    strokeDashoffset: -(orbit.value + 0.5) * perimeter,
  }));

  return (
    <View
      className="relative"
      onLayout={({ nativeEvent }) => {
        const { width, height } = nativeEvent.layout;
        setSize((previous) =>
          previous.width === width && previous.height === height
            ? previous
            : { width, height },
        );
      }}
    >
      <Animated.View
        pointerEvents="none"
        accessible={false}
        className="absolute -inset-2 rounded-3xl border-4 border-primary/30 bg-primary/20"
        style={flare}
      />
      <Animated.View
        pointerEvents="none"
        accessible={false}
        className="absolute -inset-1 rounded-3xl border-4 border-accent/50 bg-accent/20"
        style={glow}
      />
      {children}
      <Animated.View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        className="absolute inset-0 overflow-hidden rounded-2xl"
      >
        <Animated.View
          className="absolute inset-y-0 -right-16 w-16 border-accent/70 border-x-4 bg-accent/30"
          style={sweep}
        />
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        className="absolute inset-0"
        style={glow}
      >
        {size.width > 0 && (
          <Svg width={size.width} height={size.height}>
            <Rect
              x={2}
              y={2}
              width={size.width - 4}
              height={size.height - 4}
              rx={14}
              fill="none"
              stroke="#ff28a0"
              strokeWidth={2}
              opacity={0.8}
            />
            <AnimatedRect
              animatedProps={cyan}
              x={2}
              y={2}
              width={size.width - 4}
              height={size.height - 4}
              rx={14}
              fill="none"
              stroke="#00cdea"
              strokeWidth={4}
              strokeLinecap="round"
              strokeDasharray={[perimeter * 0.16, perimeter * 0.84]}
            />
            <AnimatedRect
              animatedProps={pink}
              x={2}
              y={2}
              width={size.width - 4}
              height={size.height - 4}
              rx={14}
              fill="none"
              stroke="#ff28a0"
              strokeWidth={4}
              strokeLinecap="round"
              strokeDasharray={[perimeter * 0.12, perimeter * 0.88]}
            />
          </Svg>
        )}
      </Animated.View>
      <NativeGenerativeParticles enabled={active && animate} />
    </View>
  );
}

export function NativeGenerativeInvitation({
  active,
  animate,
  children,
}: Props) {
  const pulse = useSharedValue(0);
  useEffect(() => {
    cancelAnimation(pulse);
    pulse.value = 0;
    if (animate) {
      pulse.value = withRepeat(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      );
    }
    return () => cancelAnimation(pulse);
  }, [animate, pulse]);
  const halo = useAnimatedStyle(() => ({
    opacity: active ? 0.7 : 0.2 + pulse.value * 0.5,
    transform: [{ scale: 1 + pulse.value * 0.12 }],
  }));
  const invitation = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${active || !animate ? 0 : (pulse.value - 0.5) * 5}deg` },
    ],
  }));
  return (
    <View className="relative">
      <Animated.View
        pointerEvents="none"
        className="absolute -inset-1 rounded-2xl border-2 border-accent/60 bg-accent/20"
        style={halo}
      />
      <Animated.View style={invitation}>{children}</Animated.View>
    </View>
  );
}
