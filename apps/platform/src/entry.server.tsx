import fileRoutes from 'virtual:smolter/routes';
import type { RootModule } from '@kasperrt/smolter/preact';
import { configureApplication } from '@kasperrt/smolter/preact/client';
import {
  dispatchRoute,
  renderApplication,
} from '@kasperrt/smolter/preact/server';
import { applicationEnvironment } from '@vibes/shared/navigation';
import * as root from './root';
import { loader } from './root/loader';

configureApplication(applicationEnvironment);

export const clientAssetBase = import.meta.env.BASE_URL;

export const routes = fileRoutes.map((route) => ({
  ...route,
  path: route.routePath ?? route.path,
}));

export const handleDataRequest = (request: Request) =>
  dispatchRoute(request, routes);

export default function handleRequest(request: Request, entry: string) {
  return renderApplication(
    request,
    routes,
    { ...root, loader } as RootModule,
    entry,
  );
}
