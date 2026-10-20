import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

interface Particle {
  id: number;
  x: number;
  drift: number;
  size: number;
  duration: number;
  icon: number;
}

const paths = [
  'M10 2h4v5h3v3h5v4h-5v3h-3v5h-4v-5H7v-3H2v-4h5V7h3z',
  'M12 2h4v2h4v4h-4v10h-2v2H8v-2H6v-4h2v-2h4z',
  'M8 4h12v14h-2v2h-4v-2h-2v-4h2v-2h2V8h-4v12h-2v2H6v-2H4v-4h2v-2h2z',
];

function FloatingParticle({ particle }: { particle: Particle }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(1, {
      duration: particle.duration,
      easing: Easing.linear,
    });
    return () => cancelAnimation(progress);
  }, [particle, progress]);
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.18, 0.65, 1], [0, 0.7, 0.4, 0]),
    transform: [
      { translateY: -progress.value * 32 },
      { translateX: progress.value * particle.drift },
      { rotate: `${progress.value * particle.drift}deg` },
    ],
  }));
  return (
    <Animated.View
      className="absolute bottom-0"
      style={[{ left: `${particle.x}%` }, style]}
    >
      <Svg width={particle.size} height={particle.size} viewBox="0 0 24 24">
        <Path
          d={paths[particle.icon]}
          fill={particle.icon === 1 ? '#00cdea' : '#ff28a0'}
        />
      </Svg>
    </Animated.View>
  );
}

export function NativeGenerativeParticles({ enabled }: { enabled: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const sequence = useRef(0);
  useEffect(() => {
    setParticles([]);
    if (!enabled) return;
    let timer: ReturnType<typeof setTimeout>;
    let previousX = 50;
    let previousIcon = 0;
    const emit = () => {
      const x =
        previousX < 50 ? 55 + Math.random() * 30 : 10 + Math.random() * 30;
      previousX = x;
      const icon =
        (previousIcon + 1 + Math.floor(Math.random() * 2)) % paths.length;
      previousIcon = icon;
      const particle: Particle = {
        id: sequence.current++,
        x,
        icon,
        drift: (Math.random() - 0.5) * 28,
        size: 12 + Math.random() * 6,
        duration: 1600 + Math.random() * 1000,
      };
      // At most three live particles; older slots have faded before replacement.
      setParticles((current) => [...current.slice(-2), particle]);
      timer = setTimeout(emit, 900 + Math.random() * 500);
    };
    timer = setTimeout(emit, 150);
    return () => clearTimeout(timer);
  }, [enabled]);
  if (!enabled) return null;
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className="absolute inset-x-0 bottom-full h-12"
    >
      {particles.map((particle) => (
        <FloatingParticle key={particle.id} particle={particle} />
      ))}
    </View>
  );
}
