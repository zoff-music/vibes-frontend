// Resource route loaded and submitted by rendered room routes.
export { action } from './action';
export { loader } from './loader';

export function shouldRevalidate() {
  return false;
}
