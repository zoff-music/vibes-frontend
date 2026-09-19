import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

interface PlayerFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PlayerLayoutState {
  active: boolean;
  frame: PlayerFrame | null;
}

type PlayerLayout = readonly [
  PlayerLayoutState,
  (frame: PlayerFrame | null) => void,
];

const Context = createContext<PlayerLayout | null>(null);

export function RoomPlayerLayoutProvider({ children }: PropsWithChildren) {
  const [layout, setLayout] = useState<PlayerLayoutState>({
    active: false,
    frame: null,
  });
  const updateFrame = useCallback((next: PlayerFrame | null) => {
    setLayout((previous) => {
      if (!next) {
        if (!previous.active) return previous;
        return { ...previous, active: false };
      }
      if (
        previous.active &&
        previous.frame?.x === next.x &&
        previous.frame?.y === next.y &&
        previous.frame?.width === next.width &&
        previous.frame?.height === next.height
      )
        return previous;
      return { active: true, frame: next };
    });
  }, []);
  const value = useMemo<PlayerLayout>(
    () => [layout, updateFrame],
    [layout, updateFrame],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useRoomPlayerLayout() {
  const context = useContext(Context);
  if (!context) throw new Error('RoomPlayerLayoutProvider is required');
  return context;
}
