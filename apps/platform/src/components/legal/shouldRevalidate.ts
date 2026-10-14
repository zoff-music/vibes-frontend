import type { ShouldRevalidateFunctionArgs } from 'react-router';

export function shouldRevalidate({
  currentUrl,
  nextUrl,
  formAction,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  if (currentUrl.pathname !== nextUrl.pathname) {
    return defaultShouldRevalidate;
  }

  if (formAction || currentUrl.search !== nextUrl.search) {
    return false;
  }

  return defaultShouldRevalidate;
}
