import { NotFoundPage } from '../../components/not-found/NotFoundPage';
export const id = 'routes/$/route';

export { notFoundMeta as meta } from './meta';

export default function NotFound() {
  return <NotFoundPage />;
}

export { loader } from './loader';
