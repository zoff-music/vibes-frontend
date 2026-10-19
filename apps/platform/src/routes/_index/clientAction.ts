import type { ClientActionFunctionArgs } from '@kasperrt/smolter/preact';

export function preloadHomeAction() {
  return import('./utils/actions/clientAction');
}

export async function clientAction(args: ClientActionFunctionArgs) {
  const action = await preloadHomeAction();

  return action.clientAction(args);
}
