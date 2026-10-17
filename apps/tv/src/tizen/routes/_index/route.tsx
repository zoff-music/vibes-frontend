import {
  useActionData,
  useLoaderData,
  useNavigation,
} from '@kasperrt/smolter/preact';
import { TizenApp } from '@/tizen/tizen-app';
import type { TizenSessionActionData } from './clientAction';
import type { TizenSessionLoaderData } from './clientLoader';

export { shouldRevalidate } from './shouldRevalidate';

export default function TizenSessionRoute() {
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

export { TizenHydrateFallback as HydrateFallback } from '../../tizen-hydrate-fallback';
export { TizenRecoveryView as ErrorBoundary } from '../../tizen-recovery-view';
export { clientAction } from './clientAction';
export { clientLoader } from './clientLoader';
