import { NotFoundView } from '@vibes/ui/web';
import { notFoundLoader } from './loader';
import { notFoundMeta } from './meta';

export const loader = notFoundLoader;

export const meta = notFoundMeta;

export default function NotFound() {
  return <NotFoundView />;
}
