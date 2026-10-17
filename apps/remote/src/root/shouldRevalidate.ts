import type { ShouldRevalidateFunctionArgs } from '@kasperrt/smolter/preact';

export function shouldRevalidate({
  currentUrl,
  defaultShouldRevalidate,
  nextUrl,
}: ShouldRevalidateFunctionArgs) {
  if (currentUrl.pathname === nextUrl.pathname) return false;

  return defaultShouldRevalidate;
}
