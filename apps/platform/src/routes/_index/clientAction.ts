import type { ClientActionFunctionArgs } from 'react-router';

export function preloadHomeAction() {
  return import('./action');
}

export async function clientAction(args: ClientActionFunctionArgs) {
  const action = await preloadHomeAction();
  return action.clientAction(args);
}
