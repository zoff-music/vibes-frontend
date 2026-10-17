import type { ShouldRevalidateFunctionArgs } from '@kasperrt/smolter/preact';

export function shouldRevalidate({
  defaultShouldRevalidate,
  formMethod,
}: ShouldRevalidateFunctionArgs) {
  if (formMethod) {
    return false;
  }

  return defaultShouldRevalidate;
}
