import { type ReactNode, type RefObject, useEffect, useRef } from 'react';
import { useAnimatedPlaceholder } from '../hooks/useAnimatedPlaceholder';
import { RoomJoinControls } from './RoomJoinControls';

interface HomePlaceholderProps {
  isAIMode: boolean;
  enabled: boolean;
  watch: boolean;
  children: (placeholder: string) => ReactNode;
}

// Keep the typing timer below the page so each letter only updates the form.
export function HomePlaceholder({
  isAIMode,
  enabled,
  watch,
  children,
}: HomePlaceholderProps) {
  const { placeholder, reset } = useAnimatedPlaceholder(
    isAIMode,
    enabled,
    watch,
  );
  const previousMode = useRef(isAIMode);

  useEffect(() => {
    if (previousMode.current === isAIMode) return;

    previousMode.current = isAIMode;
    reset();
  }, [isAIMode, reset]);

  return children(placeholder);
}

interface HomeRoomControlsProps {
  onJoinRoom: (roomId?: string) => void;
  onRoomCodeChange: (value: string) => void;
  onStartSession: () => void;
  onToggleAIMode: () => void;
  placeholder: string;
  roomCode: string;
  inputRef: RefObject<HTMLInputElement | null>;
}

export function HomeRoomControls({
  onJoinRoom,
  onRoomCodeChange,
  onStartSession,
  onToggleAIMode,
  placeholder,
  roomCode,
  inputRef,
}: HomeRoomControlsProps) {
  const handleJoinRoom = () => {
    onJoinRoom();
  };

  return (
    <section aria-label="Join a room" className="min-w-0">
      <RoomJoinControls
        inputRef={inputRef}
        onJoinRoom={handleJoinRoom}
        onRoomCodeChange={onRoomCodeChange}
        onStartSession={onStartSession}
        onToggleAIMode={onToggleAIMode}
        placeholder={placeholder}
        roomCode={roomCode}
      />
    </section>
  );
}
