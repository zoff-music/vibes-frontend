import { ListeningScene } from './showcase/ListeningScene';
import { Showcase } from './showcase/Showcase';

export function ListeningPreview() {
  return (
    <Showcase
      label="LISTENING TOGETHER"
      description="Two devices follow the same song and playback position in the electro room."
    >
      {(playing) => <ListeningScene playing={playing} />}
    </Showcase>
  );
}
