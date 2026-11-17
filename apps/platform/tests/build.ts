interface BuiltRoute {
  path: string;
  id?: string;
  routePath?: string;
  loader?: unknown;
  clientLoader?: unknown;
  clientAction?: unknown;
  Component?: unknown;
  component?: unknown;
}

// The integration command builds this artifact before Vitest starts.
const serverURL = new URL('../dist/server/index.js', import.meta.url).href;
export const build: {
  default: (request: Request) => Promise<Response>;
  routes: BuiltRoute[];
} = await import(serverURL);
