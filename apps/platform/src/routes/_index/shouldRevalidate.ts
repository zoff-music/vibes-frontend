import type { ShouldRevalidateFunctionArgs } from 'react-router';

export function shouldRevalidate({
  currentUrl,
  nextUrl,
  formAction,
  formMethod,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  if (currentUrl.pathname !== nextUrl.pathname) {
    return defaultShouldRevalidate;
  }

  if (
    formAction === '/resources/profile' &&
    formMethod?.toUpperCase() === 'POST'
  ) {
    return false;
  }

  if (!formMethod && currentUrl.search !== nextUrl.search) {
    const currentParams = new URLSearchParams(currentUrl.search);
    const nextParams = new URLSearchParams(nextUrl.search);

    currentParams.delete('mode');
    nextParams.delete('mode');
    currentParams.sort();
    nextParams.sort();

    if (currentParams.toString() === nextParams.toString()) {
      return false;
    }
  }

  return defaultShouldRevalidate;
}
