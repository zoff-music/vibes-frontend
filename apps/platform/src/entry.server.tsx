import fileRoutes from 'virtual:smolter/routes';
import type { RootModule } from '@kasperrt/smolter/preact';
import { configureApplication } from '@kasperrt/smolter/preact/client';
import {
  dispatchRoute,
  renderApplication,
} from '@kasperrt/smolter/preact/server';
import { documentPreloads as createDocumentPreloads } from '@vibes/serve/assets';
import { applicationEnvironment } from '@vibes/shared/navigation';
import { fontPreloadUrls } from '@vibes/ui/web';
import stylesUrl from './index.css?url';
import * as root from './root';
import { inlineCriticalCss } from './root/criticalCss.server';
import { loader } from './root/loader';

configureApplication(applicationEnvironment);

export const clientAssetBase = import.meta.env.BASE_URL;

export const documentPreloads = createDocumentPreloads(
  stylesUrl,
  fontPreloadUrls,
);

export const routes = fileRoutes;

export const handleDataRequest = (request: Request) =>
  dispatchRoute(request, routes);

export default async function handleRequest(request: Request, entry: string) {
  const response = await renderApplication(
    request,
    routes,
    { ...root, loader } as RootModule,
    entry,
    { earlyHydration: true },
  );

  return inlineCriticalCss(response);
}
