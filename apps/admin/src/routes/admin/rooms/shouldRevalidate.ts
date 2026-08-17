import type { ShouldRevalidateFunctionArgs } from 'react-router';

export function shouldRevalidate({
  actionResult,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs): boolean {
  if (
    typeof actionResult === 'object' &&
    actionResult !== null &&
    ('success' in actionResult || 'error' in actionResult)
  ) {
    return false;
  }

  return defaultShouldRevalidate;
}
