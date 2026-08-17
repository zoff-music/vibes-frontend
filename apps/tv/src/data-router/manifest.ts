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

const metroRequire = require as MetroRequire;
const routeContext = metroRequire.context(
  '../routes',
  true,
  /^\.\/.*\/route\.[jt]sx?$/,
);

export function createRouteManifest() {
  const routes = new Map<string, RouteModule>();
  for (const key of routeContext.keys().sort()) {
    const module = routeContext(key) as RouteModule;
    const routeId = getRouteId(key);
    if (routes.has(routeId)) {
      throw new Error(`Duplicate native route ID: ${routeId}`);
    }
    routes.set(routeId, module);
  }
  return routes;
}

function getRouteId(key: string) {
  return key
    .replace(/^\.\//, '')
    .replace(/\/route\.[jt]sx?$/, '')
    .replaceAll('/', '.');
}
