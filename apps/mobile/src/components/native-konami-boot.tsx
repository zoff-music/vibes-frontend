import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text, View } from 'react-native';

interface NativeKonamiBootProps {
  onComplete: () => void;
}

export function NativeKonamiBoot({ onComplete }: NativeKonamiBootProps) {
  const [visibleLineCount, setVisibleLineCount] = useState(0);
  const [ready, setReady] = useState(false);
  const terminalScaleX = useRef(new Animated.Value(0)).current;
  const terminalScaleY = useRef(new Animated.Value(0.006)).current;
  const terminalOpacity = useRef(new Animated.Value(0)).current;
  const scanPosition = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    const entrance = Animated.sequence([
      Animated.parallel([
        Animated.timing(terminalOpacity, {
          duration: 80,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(terminalScaleX, {
          duration: 190,
          easing: Easing.out(Easing.quad),
          toValue: 1,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(terminalScaleY, {
        duration: 340,
        easing: Easing.out(Easing.cubic),
        toValue: 1,
        useNativeDriver: true,
      }),
    ]);
    const scan = Animated.loop(
      Animated.timing(scanPosition, {
        duration: 1_400,
        easing: Easing.linear,
        toValue: 1,
        useNativeDriver: true,
      }),
    );
    entrance.start();
    scan.start();

    const lineTimers = bootLines.map((_, index) =>
      setTimeout(
        () => setVisibleLineCount(index + 1),
        firstLineDelayMs + index * bootLineIntervalMs,
      ),
    );
    const readyTimer = setTimeout(() => setReady(true), readyDelayMs);
    const completeTimer = setTimeout(onComplete, bootDurationMs);
    return () => {
      entrance.stop();
      scan.stop();
      lineTimers.forEach(clearTimeout);
      clearTimeout(readyTimer);
      clearTimeout(completeTimer);
    };
  }, [
    onComplete,
    scanPosition,
    terminalOpacity,
    terminalScaleX,
    terminalScaleY,
  ]);

  const progress = Math.round((visibleLineCount / bootLines.length) * 100);
  const scanTranslateY = scanPosition.interpolate({
    inputRange: [-1, 1],
    outputRange: [-120, 920],
  });

  return (
    <View
      accessibilityLabel="Zoff retro boot sequence"
      accessibilityLiveRegion="polite"
      className="absolute inset-0 z-50 items-center justify-center overflow-hidden bg-[#010705] px-4"
    >
      <View className="absolute inset-0 bg-[#31ff9a]/5" />
      <Animated.View
        className="w-full max-w-2xl border border-[#55ffad] bg-[#010c08] shadow-2xl shadow-[#31ff9a]/20"
        style={{
          opacity: terminalOpacity,
          transform: [{ scaleX: terminalScaleX }, { scaleY: terminalScaleY }],
        }}
      >
        <View className="flex-row justify-between bg-[#71f5ad] px-4 py-3">
          <Text className="font-heading text-[#03150d] text-sm uppercase">
            ZOFF BIOS v19.89
          </Text>
          <Text className="font-heading text-[#03150d] text-sm uppercase">
            [ SIGNAL TERMINAL ]
          </Text>
        </View>
        <View className="min-h-[470px] p-5">
          <Text className="mb-6 font-heading text-[#b9ffda] text-xs uppercase tracking-widest">
            ZOFF LISTENING SYSTEMS · 音楽は共有するもの
          </Text>
          <View className="gap-3">
            {bootLines.map((line, index) => (
              <View
                className={
                  index < visibleLineCount
                    ? 'flex-row items-center gap-2 opacity-100'
                    : 'flex-row items-center gap-2 opacity-0'
                }
                key={line.label}
              >
                <Text className="font-heading text-[#8cffc5] text-xs uppercase">
                  {line.label}
                </Text>
                <View className="h-px flex-1 border-[#8cffc5]/40 border-b border-dashed" />
                <Text className="font-heading text-[#e0ffef] text-xs uppercase">
                  {line.value}
                </Text>
              </View>
            ))}
          </View>

          <View className="mt-7 gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="font-heading text-[#b9ffda] text-xs uppercase tracking-widest">
                LOADING ROOM PROTOCOL
              </Text>
              <Text className="font-heading text-[#e0ffef] text-xs">
                {progress.toString().padStart(3, '0')}%
              </Text>
            </View>
            <View className="h-3 border border-[#71f5ad] p-0.5">
              <View
                className="h-full bg-[#71f5ad]"
                style={{ width: `${progress}%` }}
              />
            </View>
          </View>

          <View
            className={
              ready
                ? 'mt-8 items-center opacity-100'
                : 'mt-8 items-center opacity-0'
            }
          >
            <Text className="font-heading text-[#b9ffda] text-base">
              ╔════════════════════╗
            </Text>
            <Text className="font-heading text-lg text-white">
              ║　　ゾ フ O S　　║
            </Text>
            <Text className="font-heading text-[#b9ffda] text-base">
              ╚════════════════════╝
            </Text>
          </View>
          <Text
            className={
              ready
                ? 'mt-7 font-heading text-[#71f5ad] text-xs uppercase opacity-100'
                : 'mt-7 font-heading text-[#71f5ad] text-xs uppercase opacity-0'
            }
          >
            SIGNAL ACQUIRED. RESUMING TRANSMISSION_
          </Text>
        </View>
        <View className="flex-row justify-between border-[#71f5ad]/35 border-t px-4 py-2">
          <Text className="font-heading text-[#b9ffda]/65 text-[10px] uppercase tracking-widest">
            CH 1989
          </Text>
          <Text className="font-heading text-[#b9ffda]/65 text-[10px] uppercase tracking-widest">
            NATIVE LINK SECURE
          </Text>
        </View>
      </Animated.View>
      <View className="pointer-events-none absolute inset-0 opacity-20">
        {scanLines.map((top) => (
          <View
            className="absolute inset-x-0 h-px bg-[#8cffc5]/20"
            key={top}
            style={{ top }}
          />
        ))}
      </View>
      <Animated.View
        className="pointer-events-none absolute inset-x-0 h-28 bg-[#8cffc5]/5"
        style={{ transform: [{ translateY: scanTranslateY }] }}
      />
    </View>
  );
}

const bootLines = [
  { label: 'MEMORY TEST', value: '640K VIBES OK' },
  { label: 'MOUNTING /DEV/MUSIC', value: 'READY' },
  { label: 'SYNCING HEARTBEATS', value: 'LOCKED' },
  { label: 'YOUTUBE ADAPTER', value: 'ONLINE' },
  { label: 'SOUNDCLOUD ADAPTER', value: 'ONLINE' },
  { label: 'ROOM SIGNAL', value: 'ACQUIRED' },
] as const;

const scanLines = Array.from({ length: 220 }, (_, index) => index * 4);

const firstLineDelayMs = 700;

const bootLineIntervalMs = 350;

const readyDelayMs = 4_500;

const bootDurationMs = 7_600;
