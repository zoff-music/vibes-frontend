import { roomGenerationMaxExistingSongs } from '@vibes/models';
import { Button, SparklesIcon } from '@vibes/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { RoomPlaylistGeneration } from './RoomPlaylistGeneration';

interface RoomGenerationMenuProps {
  canGenerate: boolean;
  isGenerating: boolean;
  onGenerationStarted: () => void;
  onOpen: () => void;
  songCount: number;
}

export function RoomGenerationMenu({
  canGenerate,
  isGenerating,
  onGenerationStarted,
  onOpen,
  songCount,
}: RoomGenerationMenuProps) {
  const [showGeneration, setShowGeneration] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isAboveSongLimit = songCount > roomGenerationMaxExistingSongs;
  const isDisabled = !canGenerate || isGenerating || isAboveSongLimit;

  let description = 'Fill this playlist from a prompt';
  if (isAboveSongLimit) {
    description = `Only available when the room has ${roomGenerationMaxExistingSongs} songs or fewer`;
  }
  if (!isAboveSongLimit && isGenerating) {
    description = 'A playlist is already being generated';
  }
  if (!isAboveSongLimit && !isGenerating && !canGenerate) {
    description = 'Admin access is required to generate a playlist';
  }

  useEffect(() => {
    if (!showGeneration) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) {
        return;
      }
      if (panelRef.current?.contains(target)) {
        return;
      }
      if (buttonRef.current?.contains(target)) {
        return;
      }

      setShowGeneration(false);
    };

    const timeout = window.setTimeout(
      () => document.addEventListener('click', handleOutsideClick),
      0,
    );

    return () => {
      window.clearTimeout(timeout);
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [showGeneration]);

  const handleToggle = () => {
    if (isDisabled) {
      return;
    }
    if (!showGeneration) {
      onOpen();
    }
    setShowGeneration((current) => !current);
  };

  const handleGenerationStarted = () => {
    setShowGeneration(false);
    onGenerationStarted();
  };

  return (
    <div className="relative">
      <div title={description}>
        <Button
          ref={buttonRef}
          onClick={handleToggle}
          disabled={isDisabled}
          variant={showGeneration ? 'tertiary-active' : 'tertiary'}
          size="icon"
          aria-label={description}
          aria-pressed={showGeneration}
        >
          <SparklesIcon className="h-5 w-5" />
        </Button>
      </div>

      <AnimatePresence>
        {showGeneration && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="panel-strong absolute right-0 z-50 mt-3 w-72 rounded-3xl p-4 shadow-2xl sm:w-80"
          >
            <RoomPlaylistGeneration
              onGenerationStarted={handleGenerationStarted}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
