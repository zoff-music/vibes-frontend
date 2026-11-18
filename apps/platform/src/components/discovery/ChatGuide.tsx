import { DeferredContent } from '@vibes/ui/web';
import { lazy } from 'preact/compat';
import { FeatureSection } from './FeatureSection';

const LazyChatPreview = lazy(() =>
  import('./ChatPreview').then((module) => ({ default: module.ChatPreview })),
);

interface ChatGuideProps {
  watch?: boolean;
  reverse?: boolean;
}

export function ChatGuide({ watch = false, reverse = false }: ChatGuideProps) {
  return (
    <FeatureSection
      id="room-chat"
      title={
        watch
          ? 'For the “wait, watch this” people.'
          : 'There’s a story behind that song.'
      }
      description={
        watch
          ? 'Chat beside the video. Every add, vote and skip shows up in the conversation, so nobody has to ask what just happened.'
          : '“Who added this?” becomes part of the conversation. Chat with the room and see the picks, votes and skips as they happen.'
      }
      note="Rather just listen? Turn Chat off for your device in Settings."
      link={{
        to: watch ? '/features/watch' : '/rooms/create',
        label: watch ? 'Start a watch party' : 'Bring your people',
      }}
      reverse={reverse}
    >
      <DeferredContent fallback={<div aria-hidden="true" className="h-121" />}>
        <LazyChatPreview watch={watch} />
      </DeferredContent>
    </FeatureSection>
  );
}
