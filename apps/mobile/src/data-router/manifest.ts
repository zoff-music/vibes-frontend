import type { RouteModule } from '@vibes/native-router';

const renderedRouteContext = require.context(
  '../routes',
  true,
  /^\.\/.*\/route\.[jt]sx$/,
);
const resourceContext = require.context(
  '../routes',
  true,
  /^\.\/.*\/resource\.[jt]s$/,
);

export function createRouteManifest() {
  const routes = new Map<string, RouteModule>();
  addRoutes(routes, renderedRouteContext);
  addRoutes(routes, resourceContext);
  return routes;
}

function addRoutes(routes: Map<string, RouteModule>, context: RequireContext) {
  for (const key of context.keys().sort()) {
    const routeId = getRouteId(key);
    if (routeId === '_layout') continue;
    if (routes.has(routeId)) {
      throw new Error(`Duplicate native route ID: ${routeId}`);
    }
    routes.set(routeId, context(key) as RouteModule);
  }
}

function getRouteId(key: string) {
  return key
    .replace(/^\.\//, '')
    .replace(/\/(?:route\.[jt]sx|resource\.[jt]s)$/, '')
    .replaceAll('/', '.');
}

interface RequireContext {
  (key: string): unknown;
  keys: () => string[];
}
