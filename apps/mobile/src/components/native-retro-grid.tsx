import { classNames } from '@vibes/shared';
import { useNativePresentation } from '@vibes/ui/native';
import { useEffect, useState } from 'react';
import { Animated, useWindowDimensions, View } from 'react-native';

interface NativeRetroGridProps {
  paused?: boolean;
}

export function NativeRetroGrid({ paused = false }: NativeRetroGridProps) {
  const terminal = useNativePresentation() === 'terminal';
  const { height, width } = useWindowDimensions();
  const [gridOffset] = useState(() => new Animated.Value(0));
  const gridHeight = Math.max(height * 1.3, minimumGridHeight);
  const rowCount = Math.ceil(gridHeight / gridCellSize) + gridLoopCellCount + 1;
  const gridRows = Array.from(
    { length: rowCount },
    (_, index) => index * gridCellSize,
  );

  useEffect(() => {
    if (paused) {
      gridOffset.stopAnimation();
      return;
    }
    const animation = Animated.loop(
      Animated.timing(gridOffset, {
        duration: gridAnimationDurationMs,
        toValue: gridLoopDistance,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [gridOffset, paused]);

  return (
    <View
      className={classNames(
        'absolute inset-0 overflow-hidden',
        terminal && 'bg-[#010705]',
      )}
      pointerEvents="none"
    >
      <View
        className="absolute opacity-45"
        style={{
          bottom: -height * 0.3,
          height: gridHeight,
          left: -width * 0.5,
          transform: [{ perspective: 600 }, { rotateX: '58deg' }],
          width: width * 2,
        }}
      >
        {gridColumns.map((position) => (
          <View
            className={classNames(
              'absolute inset-y-0 w-px bg-primary/25 dark:bg-primary/30',
              terminal && 'bg-[#55ffad]/15 dark:bg-[#55ffad]/15',
            )}
            key={`column-${position}`}
            style={{ left: `${position}%` }}
          />
        ))}
        <Animated.View
          className="absolute inset-x-0"
          style={{
            height: gridHeight + gridLoopDistance,
            top: -gridLoopDistance,
            transform: [{ translateY: gridOffset }],
          }}
        >
          {gridRows.map((position) => (
            <View
              className={classNames(
                'absolute inset-x-0 h-px bg-accent/25 dark:bg-accent/30',
                terminal && 'bg-[#55ffad]/15 dark:bg-[#55ffad]/15',
              )}
              key={`row-${position}`}
              style={{ top: position }}
            />
          ))}
        </Animated.View>
      </View>
    </View>
  );
}

const gridColumns = Array.from({ length: 21 }, (_, index) => index * 5);
const gridCellSize = 64;
const gridLoopCellCount = 24;
const gridLoopDistance = gridCellSize * gridLoopCellCount;
const gridAnimationDurationMs = 2_000 * gridLoopCellCount;
const minimumGridHeight = 900;
