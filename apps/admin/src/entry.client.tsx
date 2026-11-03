import deployment from 'virtual:smolter/deployment';
import routes from 'virtual:smolter/routes';
import type { RootModule } from '@kasperrt/smolter/preact';
import {
  configureApplication,
  mountApplication,
} from '@kasperrt/smolter/preact/client';
import { initializeBrowserAnalytics } from '@vibes/api/browserAnalytics';
import { applicationEnvironment } from '@vibes/shared/navigation';
import * as root from './root';

configureApplication(applicationEnvironment);
initializeBrowserAnalytics();

mountApplication(
  routes,
  {
    ...root,
    loaderPath: '/resources/root',
  } as RootModule,
  { deployment },
);
