import deployment from 'virtual:smolter/deployment';
import routes from 'virtual:smolter/routes';
import {
  configureApplication,
  mountApplication,
  watchDeployment,
} from '@kasperrt/smolter/preact/client';
import { applicationEnvironment } from '@vibes/shared/navigation';
import './src/styles/index.css';

configureApplication(applicationEnvironment);

const loading = document.getElementById('static-loading');
loading?.classList.add('hidden');
mountApplication(routes).then((router) => watchDeployment(router, deployment));
