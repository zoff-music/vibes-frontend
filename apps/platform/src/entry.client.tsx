import deployment from 'virtual:smolter/deployment';
import routes from 'virtual:smolter/routes';
import type { RootModule } from '@kasperrt/smolter/preact';
import {
  configureApplication,
  mountApplication,
} from '@kasperrt/smolter/preact/client';
import { applicationEnvironment } from '@vibes/shared/navigation';
import { safeWrapAsync } from '@vibes/shared/wrap';
import { render } from 'preact';
import { StartupError } from './components/errors/StartupError';
import * as root from './root';

configureApplication(applicationEnvironment);

const [startupError] = await safeWrapAsync(
  mountApplication(
    routes,
    {
      ...root,
      loaderPath: '/resources/root',
    } as RootModule,
    { deployment },
  ),
);

if (startupError) {
  console.error('Unable to start Zoff', startupError);
  const target = document.getElementById('root') ?? document.body;
  render(<StartupError />, target);
}
