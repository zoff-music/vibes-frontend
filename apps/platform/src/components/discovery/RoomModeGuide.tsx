import { DeferredContent } from '@vibes/ui/web';
import { lazy } from 'preact/compat';
import { FeatureSection } from './FeatureSection';

const LazyRoomModePreview = lazy(() =>
  import('./RoomModePreview').then((module) => ({
    default: module.RoomModePreview,
  })),
);

interface RoomModeGuideProps {
  watch?: boolean;
  reverse?: boolean;
}

export function RoomModeGuide({
  watch = false,
  reverse = false,
}: RoomModeGuideProps) {
  return (
    <FeatureSection
      id="room-modes"
      title="Let it play. Or take the lead."
      description={
        watch
          ? 'Server Mode keeps the videos going on its own as people come and go. Host Mode follows one person’s player, so the host can pause for snacks.'
          : 'Server Mode keeps the queue playing on its own as people come and go. Host Mode follows one person’s player for a party or a set.'
      }
      reverse={reverse}
    >
      <DeferredContent fallback={<div aria-hidden="true" className="h-112" />}>
        <LazyRoomModePreview watch={watch} />
      </DeferredContent>
    </FeatureSection>
  );
}
