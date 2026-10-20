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
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
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
        duration: 1400,
        easing: Easing.linear,
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
  const flare = useAnimatedStyle(() => {
    const spread = interpolate(
      ignition.value,
      [0, 0.12, 0.55, 1],
      [0, 0.12, 1, 1],
    );
    return {
      opacity:
        power.value *
        interpolate(ignition.value, [0, 0.12, 0.55, 1], [0, 1, 1, 0.25]),
      transform: [
        { translateX: ((1 - spread) * size.width) / 2 },
        { scaleX: spread },
      ],
    };
  });
  const ready = useAnimatedStyle(() => ({
    opacity: power.value * interpolate(ignition.value, [0, 0.5, 1], [0, 0, 1]),
  }));
  const rail = useAnimatedProps(() => {
    const spread = interpolate(
      ignition.value,
      [0, 0.09, 0.65, 1],
      [0, 0, 1, 1],
    );
    return {
      x: size.width * (1 - spread),
      width: size.width * spread,
      opacity:
        power.value *
        interpolate(ignition.value, [0, 0.09, 0.65, 1], [0, 1, 1, 0]),
    };
  });
  const sweep = useAnimatedStyle(() => ({
    opacity:
      power.value *
      interpolate(
        ignition.value,
        [0, 0.12, 0.28, 0.6, 0.9, 1],
        [0, 0, 1, 1, 0, 0],
      ),
    transform: [
      {
        translateX: interpolate(
          ignition.value,
          [0, 0.12, 0.9, 1],
          [size.width / 6, size.width / 6, -size.width, -size.width],
        ),
      },
    ],
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
        className="absolute -inset-2 rounded-3xl border-4 border-primary/20 bg-primary/20"
        style={flare}
      />
      <Animated.View
        pointerEvents="none"
        accessible={false}
        className="absolute -inset-1 rounded-3xl border-2 border-accent/40 bg-accent/10"
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
          className="absolute inset-y-0 right-0 w-1/3"
          style={sweep}
        >
          <Svg width="100%" height="100%">
            <Defs>
              <LinearGradient id="charge-sweep" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor="#00cdea" stopOpacity={0} />
                <Stop offset="0.5" stopColor="#00cdea" stopOpacity={0.35} />
                <Stop offset="1" stopColor="#00cdea" stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#charge-sweep)" />
          </Svg>
        </Animated.View>
        {size.width > 0 && (
          <Svg width={size.width} height={size.height}>
            <Defs>
              <LinearGradient id="charge-rail" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor="#ff28a0" />
                <Stop offset="0.5" stopColor="#ffffff" />
                <Stop offset="1" stopColor="#00cdea" />
              </LinearGradient>
            </Defs>
            <AnimatedRect
              animatedProps={rail}
              y={1}
              height={2}
              fill="url(#charge-rail)"
            />
            <AnimatedRect
              animatedProps={rail}
              y={size.height - 3}
              height={2}
              fill="url(#charge-rail)"
            />
          </Svg>
        )}
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        className="absolute inset-0"
        style={ready}
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
  const activation = useSharedValue(1);
  useEffect(() => {
    cancelAnimation(activation);
    activation.value = 1;
    if (active && animate) {
      activation.value = 0;
      activation.value = withTiming(1, {
        duration: 800,
        easing: Easing.linear,
      });
    }
    return () => cancelAnimation(activation);
  }, [active, animate, activation]);
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
    opacity: active
      ? interpolate(activation.value, [0, 0.25, 1], [0.3, 1, 0.7])
      : 0.2 + pulse.value * 0.5,
    transform: [
      {
        scale: active
          ? interpolate(activation.value, [0, 0.25, 1], [1, 1.3, 1])
          : 1 + pulse.value * 0.12,
      },
    ],
  }));
  const invitation = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${active || !animate ? 0 : (pulse.value - 0.5) * 5}deg` },
      {
        scale: active
          ? interpolate(activation.value, [0, 0.25, 1], [0.9, 1.12, 1])
          : 1,
      },
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
