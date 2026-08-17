// Resource route loaded and submitted by the rendered add-music route.
export { action } from './action';
export { loader } from './loader';

export function shouldRevalidate() {
  return false;
}
