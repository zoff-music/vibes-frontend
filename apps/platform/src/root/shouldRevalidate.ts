import type { ShouldRevalidateFunctionArgs } from '@kasperrt/smolter/preact';

export function shouldRevalidate({
  currentUrl,
  formAction,
  formMethod,
}: ShouldRevalidateFunctionArgs) {
  return (
    Boolean(formAction) &&
    new URL(formAction ?? '', currentUrl).pathname === '/resources/profile' &&
    formMethod?.toUpperCase() === 'POST'
  );
}
