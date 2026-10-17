import type { ShouldRevalidateFunctionArgs } from '@kasperrt/smolter/preact';

export function shouldRevalidate({
  formAction,
  formMethod,
}: ShouldRevalidateFunctionArgs) {
  return (
    formAction === '/resources/profile' && formMethod?.toUpperCase() === 'POST'
  );
}
