export {
  ErrorBoundary,
  HydrateFallback,
} from '../_index/components/route-boundaries';
export { action } from './action';
export { loader } from './loader';

export function shouldRevalidate() {
  return false;
}
