import type { RouteModule } from '@vibes/native-router';

const expoRouteContext = require.context('../app', true, /^\.\/.*\.[jt]sx?$/);
const resourceContext = require.context(
  '../routes',
  true,
  /^\.\/.*\/resource\.[jt]s$/,
);

export function createRouteManifest() {
  const routes = new Map<string, RouteModule>();
  addRoutes(routes, expoRouteContext, getExpoRouteId);
  addRoutes(routes, resourceContext, getResourceRouteId);
  return routes;
}

function addRoutes(
  routes: Map<string, RouteModule>,
  context: RequireContext,
  getRouteId: (key: string) => string | null,
) {
  for (const key of context.keys().sort()) {
    const routeId = getRouteId(key);
    if (!routeId) continue;
    if (routes.has(routeId)) {
      throw new Error(`Duplicate native route ID: ${routeId}`);
    }
    routes.set(routeId, context(key) as RouteModule);
  }
}

function getExpoRouteId(key: string) {
  const path = key.replace(/^\.\//, '').replace(/\.[jt]sx?$/, '');
  const segments = path.split('/');
  if (segments.some((segment) => segment === '_layout')) return null;
  if (segments.some((segment) => segment.startsWith('+'))) return null;
  const routeSegments = segments
    .filter((segment) => !segment.startsWith('('))
    .map((segment) => {
      const parameter = segment.match(/^\[(.+)\]$/)?.[1];
      return parameter ? `$${parameter}` : segment;
    });
  if (routeSegments.at(-1) === 'index') routeSegments.pop();
  return routeSegments.length === 0 ? '_index' : routeSegments.join('.');
}

function getResourceRouteId(key: string) {
  return key
    .replace(/^\.\//, '')
    .replace(/\/resource\.[jt]s$/, '')
    .replaceAll('/', '.');
}

interface RequireContext {
  (key: string): unknown;
  keys: () => string[];
}
