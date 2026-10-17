import { MusicDemo } from '../../../components/seo/MusicDemo';
import { useShowcaseMotion } from '../../../components/seo/useShowcaseMotion';
import { ListeningScene } from './showcase/ListeningScene';

export function ListeningPreview() {
  const { ref, state, actions } = useShowcaseMotion();

  return (
    <MusicDemo
      elementRef={ref}
      label="Different places. Same song."
      detail="One room link brings you together."
      caption="Join the room and pick up at the same point in the song."
      paused={state.paused}
      onToggle={actions.toggle}
      presentation="stage"
      className="h-152 sm:h-160"
    >
      <ListeningScene playing={state.playing} />
    </MusicDemo>
  );
}
