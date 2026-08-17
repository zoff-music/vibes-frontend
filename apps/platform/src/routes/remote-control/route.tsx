import type { ShouldRevalidateFunctionArgs } from 'react-router';

export { clientAction } from './action';

export function shouldRevalidate({
  defaultShouldRevalidate,
  formMethod,
}: ShouldRevalidateFunctionArgs) {
  if (formMethod) {
    return false;
  }
  return defaultShouldRevalidate;
}

export default function RemoteControlResource() {
  return null;
}
