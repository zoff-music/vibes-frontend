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
import { loader } from './root/loader';

configureApplication(applicationEnvironment);

export const clientAssetBase = import.meta.env.BASE_URL;

// Room artwork (the largest paint) comes from YouTube's image host: open that connection from the
// Link header and Early Hints, which add nothing to the document's first-round-trip bytes. The
// embed origins are left alone: an earlier embed moves its own layout shift into the load window.
const providerPreconnects = ['<https://i.ytimg.com>; rel=preconnect'];

export const documentPreloads = [
  ...createDocumentPreloads(stylesUrl, fontPreloadUrls),
  ...providerPreconnects,
];

export const routes = fileRoutes;

export const handleDataRequest = (request: Request) =>
  dispatchRoute(request, routes);

export default function handleRequest(request: Request, entry: string) {
  return renderApplication(
    request,
    routes,
    { ...root, loader } as RootModule,
    entry,
    { earlyHydration: true },
  );
}
