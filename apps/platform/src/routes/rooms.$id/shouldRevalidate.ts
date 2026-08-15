import type { ShouldRevalidateFunctionArgs } from 'react-router';

export function shouldRevalidate({
  actionResult,
  currentUrl,
  defaultShouldRevalidate,
  nextUrl,
}: ShouldRevalidateFunctionArgs) {
  if (
    typeof actionResult === 'object' &&
    actionResult !== null &&
    'intent' in actionResult &&
    typeof actionResult.intent === 'string'
  ) {
    return false;
  }

  if (currentUrl.pathname === nextUrl.pathname) {
    return false;
  }

  return defaultShouldRevalidate;
}
