import type { ClientActionFunctionArgs } from '@kasperrt/smolter/preact';

export function preloadHomeAction() {
  return import('./utils/submitHomeAction');
}

export async function clientAction(args: ClientActionFunctionArgs) {
  const action = await preloadHomeAction();

  return action.submitHomeAction(args);
}
