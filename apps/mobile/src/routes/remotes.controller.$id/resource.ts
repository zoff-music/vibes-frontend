// Resource route loaded and submitted by the rendered remote route.
export { action } from './action';
export { loader } from './loader';

export function shouldRevalidate() {
  return false;
}
