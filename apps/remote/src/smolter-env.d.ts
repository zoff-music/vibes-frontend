/// <reference types="vite/client" />
declare module 'virtual:smolter/routes' {
  import type { AppRoute } from '@kasperrt/smolter/preact';

  const routes: AppRoute[];
  export default routes;
}

declare module 'virtual:smolter/deployment' {
  const deployment:
    | import('@kasperrt/smolter/preact/client').DeploymentOptions
    | null;
  export default deployment;
}
