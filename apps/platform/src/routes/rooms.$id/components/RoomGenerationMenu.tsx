import { classNames } from '@vibes/shared';
import { Button, Modal, SparklesIcon, Tooltip } from '@vibes/ui/web';
import { useState } from 'react';
import { RoomPlaylistGeneration } from './RoomPlaylistGeneration';

interface RoomGenerationMenuProps {
  generationCount: number;
  roomGenerationMaxDailyCount: number;
  roomGenerationMaxExistingPlaylistItems: number;
  hasGenerationPermission: boolean;
  isGenerating: boolean;
  onGenerationStarted: () => void;
  onOpen: () => void;
  playlistItemCount: number;
}

export function RoomGenerationMenu({
  generationCount,
  roomGenerationMaxDailyCount,
  roomGenerationMaxExistingPlaylistItems,
  hasGenerationPermission,
  isGenerating,
  onGenerationStarted,
  onOpen,
  playlistItemCount,
}: RoomGenerationMenuProps) {
  const [showGeneration, setShowGeneration] = useState(false);
  const isAbovePlaylistItemLimit =
    playlistItemCount > roomGenerationMaxExistingPlaylistItems;
  const playlistItemCountCutoff = roomGenerationMaxExistingPlaylistItems + 1;
  const isAboveDailyLimit = generationCount >= roomGenerationMaxDailyCount;
  const isDisabled =
    !hasGenerationPermission ||
    isGenerating ||
    isAbovePlaylistItemLimit ||
    isAboveDailyLimit;

  let description = 'Fill this playlist from a prompt';
  if (!hasGenerationPermission) {
    description = 'Log in as admin to fill this playlist';
  }
  if (hasGenerationPermission && isAbovePlaylistItemLimit) {
    description = `Unavailable when the room has ${playlistItemCountCutoff} songs or more`;
  }
  if (hasGenerationPermission && !isAbovePlaylistItemLimit && isGenerating) {
    description = 'A playlist is already being generated';
  }
  if (
    hasGenerationPermission &&
    !isAbovePlaylistItemLimit &&
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
