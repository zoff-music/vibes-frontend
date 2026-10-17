/// <reference types="vite/client" />
declare module 'virtual:smolter/routes' {
  import type { AppRoute } from '@kasperrt/smolter/preact';

  const routes: AppRoute[];
  export default routes;
}
