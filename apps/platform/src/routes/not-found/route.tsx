import { NotFoundPage } from '../../components/not-found/NotFoundPage';
import { notFoundLoader } from './loader';
import { notFoundMeta } from './meta';

export const loader = notFoundLoader;

export const meta = notFoundMeta;

export default function NotFound() {
  return <NotFoundPage />;
}
