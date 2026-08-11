import { classNames } from '@vibes/shared';
import { Button, Modal, SparklesIcon, Tooltip } from '@vibes/ui/web';
import { useState } from 'react';
import { RoomPlaylistGeneration } from './RoomPlaylistGeneration';

interface RoomGenerationMenuProps {
  generationCount: number;
  roomGenerationMaxDailyCount: number;
  roomGenerationMaxExistingSongs: number;
  hasGenerationPermission: boolean;
  isGenerating: boolean;
  onGenerationStarted: () => void;
  onOpen: () => void;
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
  songCount,
}: RoomGenerationMenuProps) {
  const [showGeneration, setShowGeneration] = useState(false);
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

  const handleClose = () => {
    setShowGeneration(false);
  };

  return (
    <div className="relative">
      <Tooltip className="inline-flex" content={description} side="top">
        <Button
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

      <Modal
        ariaLabelledBy="room-generation-title"
        isOpen={showGeneration}
        onClose={handleClose}
        size="sm"
      >
        <RoomPlaylistGeneration onGenerationStarted={handleGenerationStarted} />
      </Modal>
    </div>
  );
}
