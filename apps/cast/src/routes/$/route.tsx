import { useLoaderData } from '@kasperrt/smolter/preact';
import { App } from '../../App';
import type { clientLoader } from './clientLoader';

export { ErrorBoundary } from './ErrorBoundary';
export { shouldRevalidate } from './shouldRevalidate';

export default function CastRoute() {
  const loaderData = useLoaderData<typeof clientLoader>();

  return <App loaderData={loaderData} />;
}

export { clientAction } from './clientAction';
export { clientLoader } from './clientLoader';
