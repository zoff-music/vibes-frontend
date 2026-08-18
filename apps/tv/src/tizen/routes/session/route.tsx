import type { ShouldRevalidateFunctionArgs } from 'react-router';
import { useActionData, useLoaderData, useNavigation } from 'react-router';
import { TizenApp } from '@/tizen/tizen-app';
import type { TizenSessionActionData } from './action';
import type { TizenSessionLoaderData } from './loader';

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

export function TizenSessionRoute() {
  const loaderData = useLoaderData() as TizenSessionLoaderData;
  const actionData = useActionData() as TizenSessionActionData | undefined;
  const navigation = useNavigation();
  return (
    <TizenApp
      key={loaderData.roomId || 'landing'}
      actionError={actionData?.error ?? ''}
      loaderData={loaderData}
      loading={navigation.state !== 'idle'}
    />
  );
}
