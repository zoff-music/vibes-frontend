import type { ComponentProps } from 'react';
import { useCallback, useRef, useState } from 'react';
import {
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollView,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

interface ScrollEdgeFadesProps {
  backgroundColor: string;
  bottomVisible: boolean;
  topVisible: boolean;
}

interface ScrollEdgeFadeProps {
  backgroundColor: string;
  direction: 'top' | 'bottom';
}

interface UseScrollEdgeFadesOptions {
  onScroll?: ComponentProps<typeof ScrollView>['onScroll'];
}

interface ScrollEdgeFadeHandlers {
  bottomVisible: boolean;
  onContentSizeChange: (width: number, height: number) => void;
  onLayout: (event: LayoutChangeEvent) => void;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  topVisible: boolean;
}

export function ScrollEdgeFades({
  backgroundColor,
  bottomVisible,
  topVisible,
}: ScrollEdgeFadesProps) {
  return (
    <View
      className="pointer-events-none absolute inset-0 z-30"
      pointerEvents="none"
    >
      {topVisible && (
        <Animated.View
          className="absolute inset-x-0 top-0 h-10"
          entering={FadeIn.duration(fadeDuration)}
          exiting={FadeOut.duration(fadeDuration)}
        >
          <ScrollEdgeFade backgroundColor={backgroundColor} direction="top" />
        </Animated.View>
      )}
      {bottomVisible && (
        <Animated.View
          className="absolute inset-x-0 bottom-0 h-16"
          entering={FadeIn.duration(fadeDuration)}
          exiting={FadeOut.duration(fadeDuration)}
        >
          <ScrollEdgeFade
            backgroundColor={backgroundColor}
            direction="bottom"
          />
        </Animated.View>
      )}
    </View>
  );
}

export function useScrollEdgeFades({
  onScroll,
}: UseScrollEdgeFadesOptions = {}): ScrollEdgeFadeHandlers {
  const contentHeight = useRef(0);
  const layoutHeight = useRef(0);
  const offset = useRef(0);
  const [topVisible, setTopVisible] = useState(false);
  const [bottomVisible, setBottomVisible] = useState(false);

  const updateVisibility = useCallback(() => {
    setTopVisible(offset.current > edgeThreshold);
    setBottomVisible(
      offset.current + layoutHeight.current <
        contentHeight.current - edgeThreshold,
    );
  }, []);

  const handleContentSizeChange = useCallback(
    (_width: number, height: number) => {
      contentHeight.current = height;
      updateVisibility();
    },
    [updateVisibility],
  );

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      layoutHeight.current = event.nativeEvent.layout.height;
      updateVisibility();
    },
    [updateVisibility],
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      offset.current = Math.max(event.nativeEvent.contentOffset.y, 0);
      contentHeight.current = event.nativeEvent.contentSize.height;
      layoutHeight.current = event.nativeEvent.layoutMeasurement.height;
      updateVisibility();
      onScroll?.(event);
    },
    [onScroll, updateVisibility],
  );

  return {
    bottomVisible,
    onContentSizeChange: handleContentSizeChange,
    onLayout: handleLayout,
    onScroll: handleScroll,
    topVisible,
  };
}

function ScrollEdgeFade({ backgroundColor, direction }: ScrollEdgeFadeProps) {
  const startsOpaque = direction === 'top';
  return (
    <Svg
      height="100%"
      preserveAspectRatio="none"
      viewBox="0 0 1 1"
      width="100%"
    >
      <Defs>
        <LinearGradient id="scroll-edge-fade" x1="0" x2="0" y1="0" y2="1">
          <Stop
            offset="0"
            stopColor={backgroundColor}
            stopOpacity={startsOpaque ? 1 : 0}
          />
          <Stop
            offset="1"
            stopColor={backgroundColor}
            stopOpacity={startsOpaque ? 0 : 1}
          />
        </LinearGradient>
      </Defs>
      <Rect fill="url(#scroll-edge-fade)" height="1" width="1" x="0" y="0" />
    </Svg>
  );
}

const edgeThreshold = 4;
const fadeDuration = 120;
