import type { ShouldRevalidateFunctionArgs } from '@kasperrt/smolter/preact';

export function shouldRevalidate({
  actionResult,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  if (
    typeof actionResult === 'object' &&
    actionResult !== null &&
    'intent' in actionResult &&
    typeof actionResult.intent === 'string'
  ) {
    return false;
  }

  return defaultShouldRevalidate;
}
