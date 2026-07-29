import { classNames } from '@vibes/shared';
import { Button, SparklesIcon, Tooltip } from '@vibes/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { RoomPlaylistGeneration } from './RoomPlaylistGeneration';

interface RoomGenerationMenuProps {
  generationCount: number;
  roomGenerationMaxDailyCount: number;
  roomGenerationMaxExistingSongs: number;
  hasGenerationPermission: boolean;
  isGenerating: boolean;
  onGenerationStarted: () => void;
  onOpen: () => void;
  side?: 'bottom' | 'top';
  songCount: number;
}

export function RoomGenerationMenu({
  generationCount,
  roomGenerationMaxDailyCount,
  roomGenerationMaxExistingSongs,
  hasGenerationPermission,
  isGenerating,
  onGenerationStarted,
  onOpen,
  side = 'bottom',
  songCount,
}: RoomGenerationMenuProps) {
  const [showGeneration, setShowGeneration] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isAboveSongLimit = songCount > roomGenerationMaxExistingSongs;
  const songCountCutoff = roomGenerationMaxExistingSongs + 1;
  const isAboveDailyLimit = generationCount >= roomGenerationMaxDailyCount;
  const isDisabled =
    !hasGenerationPermission ||
    isGenerating ||
    isAboveSongLimit ||
    isAboveDailyLimit;

  let description = 'Fill this playlist from a prompt';
  if (!hasGenerationPermission) {
    description = 'Log in as admin to fill this playlist';
  }
  if (hasGenerationPermission && isAboveSongLimit) {
    description = `Unavailable when the room has ${songCountCutoff} songs or more`;
  }
  if (hasGenerationPermission && !isAboveSongLimit && isGenerating) {
    description = 'A playlist is already being generated';
  }
  if (
    hasGenerationPermission &&
    !isAboveSongLimit &&
    !isGenerating &&
    isAboveDailyLimit
  ) {
    description = `This room has used its ${roomGenerationMaxDailyCount} playlist generations for the day`;
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
      <Tooltip className="inline-flex" content={description} side={side}>
        <Button
          ref={buttonRef}
          onClick={handleToggle}
          disabled={isDisabled}
          variant={showGeneration ? 'tertiary-active' : 'tertiary'}
          size="icon"
          aria-label={description}
          aria-pressed={showGeneration}
        >
          <SparklesIcon
            className={classNames(
              'h-5 w-5',
              isGenerating && 'animate-ai-sparkles',
            )}
          />
        </Button>
      </Tooltip>

      <AnimatePresence>
        {showGeneration && (
          <motion.div
            key="generation-menu"
            ref={panelRef}
            initial={{ opacity: 0, scale: 0.92, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -6 }}
            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            className={classNames(
              'panel-strong absolute right-0 z-50 w-72 rounded-3xl p-4 shadow-2xl sm:w-80',
              side === 'bottom' && 'top-full mt-3 origin-top-right',
              side === 'top' && 'bottom-full mb-3 origin-bottom-right',
            )}
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
