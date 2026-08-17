// Resource route loaded and submitted by the root native layout.
export { action } from './action';
export { loader } from './loader';

export function shouldRevalidate() {
  return false;
}
