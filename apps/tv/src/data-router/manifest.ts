import type { RouteModule } from '@vibes/native-router';

interface RouteContext {
  (key: string): unknown;
  keys: () => string[];
}

interface MetroRequire extends NodeRequire {
  context: (
    directory: string,
    useSubdirectories: boolean,
    pattern: RegExp,
  ) => RouteContext;
}

const renderedRouteContext = (require as MetroRequire).context(
  '../routes',
  true,
  /^\.\/.*\/route\.[jt]sx$/,
) as RouteContext;
const resourceContext = (require as MetroRequire).context(
  '../routes',
  true,
  /^\.\/.*\/resource\.[jt]s$/,
) as RouteContext;

export function createRouteManifest() {
  const routes = new Map<string, RouteModule>();
  addRoutes(routes, renderedRouteContext);
  addRoutes(routes, resourceContext);
  return routes;
}

function addRoutes(routes: Map<string, RouteModule>, context: RouteContext) {
  for (const key of context.keys().sort()) {
    const module = context(key) as RouteModule;
    const routeId = getRouteId(key);
    if (routes.has(routeId)) {
      throw new Error(`Duplicate native route ID: ${routeId}`);
    }
    routes.set(routeId, module);
  }
}

function getRouteId(key: string) {
  return key
    .replace(/^\.\//, '')
    .replace(/\/(?:route\.[jt]sx|resource\.[jt]s)$/, '')
    .replaceAll('/', '.');
}
