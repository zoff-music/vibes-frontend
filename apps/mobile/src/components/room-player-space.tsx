import { useFocusEffect, usePathname } from 'expo-router';
import { type Ref, useCallback, useImperativeHandle, useRef } from 'react';
import { View } from 'react-native';
import { useRoomPlayerLayout } from '@/providers/room-player-layout-provider';

export interface RoomPlayerSpaceHandle {
  measure: () => void;
}

interface Props {
  width: number;
  height: number;
  ref: Ref<RoomPlayerSpaceHandle>;
}

export function RoomPlayerSpace({ width, height, ref }: Props) {
  const viewRef = useRef<View>(null);
  const pathname = usePathname();
  const [, updateFrame] = useRoomPlayerLayout();
  const measure = useCallback(() => {
    if (pathname !== '/') return;
    viewRef.current?.measureInWindow((x, y, measuredWidth, measuredHeight) => {
      if (measuredWidth <= 0 || measuredHeight <= 0) return;
      updateFrame({ x, y, width: measuredWidth, height: measuredHeight });
    });
  }, [pathname, updateFrame]);
  useImperativeHandle(ref, () => ({ measure }), [measure]);

  useFocusEffect(
    useCallback(() => {
      const frame = requestAnimationFrame(measure);
      return () => {
        cancelAnimationFrame(frame);
        updateFrame(null);
      };
    }, [measure, updateFrame]),
  );

  return (
    <View
      ref={viewRef}
      collapsable={false}
      className="shrink-0 self-center"
      style={{ width, height }}
      onLayout={measure}
    />
  );
}
