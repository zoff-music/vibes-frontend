import { MusicDemo } from '../seo/MusicDemo';
import { useShowcaseMotion } from '../seo/useShowcaseMotion';
import { ListeningScene } from './showcase/ListeningScene';

interface ListeningPreviewProps {
  watch?: boolean;
}

export function ListeningPreview({ watch = false }: ListeningPreviewProps) {
  const { ref, state, actions } = useShowcaseMotion();

  return (
    <MusicDemo
      elementRef={ref}
      label={
        watch
          ? 'Different screens. Same moment.'
          : 'Different places. Same song.'
      }
      detail="One room link brings you together."
      caption={
        watch
          ? 'Open the link and pick up at the same point in the video.'
          : 'Open the link and pick up at the same point in the song.'
      }
      paused={state.paused}
      onToggle={actions.toggle}
      presentation="stage"
    >
      <ListeningScene playing={state.playing} watch={watch} />
    </MusicDemo>
  );
}
