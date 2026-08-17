import type { ShouldRevalidateFunctionArgs } from 'react-router';
import { useLoaderData, useRouteError } from 'react-router';
import { App } from '../../App';
import { CastRecoveryView } from '../../components/CastErrorBoundary';
import type { loader } from './loader';

export function shouldRevalidate({
  defaultShouldRevalidate,
  formMethod,
}: ShouldRevalidateFunctionArgs): boolean {
  if (formMethod && formMethod.toUpperCase() !== 'GET') return false;
  return defaultShouldRevalidate;
}

export function ErrorBoundary() {
  useRouteError();
  return <CastRecoveryView />;
}

export default function CastRoute() {
  const loaderData = useLoaderData<typeof loader>();
  return <App loaderData={loaderData} />;
}
