// Resource route loaded and submitted by the settings route.
export { action } from './action';
export { loader } from './loader';

export function shouldRevalidate() {
  return false;
}
