import type { ShouldRevalidateFunctionArgs } from '@kasperrt/smolter/preact';

export function shouldRevalidate({
  actionResult,
  defaultShouldRevalidate,
  formMethod,
}: ShouldRevalidateFunctionArgs): boolean {
  if (formMethod && actionResult && !(actionResult instanceof Response)) {
    return false;
  }

  return defaultShouldRevalidate;
}
