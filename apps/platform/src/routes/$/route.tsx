import { NotFoundPage } from '../../components/not-found/NotFoundPage';

export { notFoundMeta as meta } from './meta';

export default function NotFound() {
  return <NotFoundPage />;
}

export { viewTransition } from '../../utils/viewTransition';
export { loader } from './loader';
