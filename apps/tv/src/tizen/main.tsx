import routes from 'virtual:smolter/routes';
import {
  configureApplication,
  mountApplication,
} from '@kasperrt/smolter/preact/client';
import { applicationEnvironment } from '@vibes/shared/navigation';
import '@/tizen/tizen.css';

configureApplication(applicationEnvironment);

mountApplication(routes, undefined, { hash: true });
