import { Showcase } from '../../../components/seo/Showcase';
import { ListeningScene } from './showcase/ListeningScene';

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
