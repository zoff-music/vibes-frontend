import { api } from '@vibes/api';
import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HydratedRouter } from 'react-router/dom';
import { embedApiHeaders } from './embed-api';

api.config({ fetchOpts: { headers: embedApiHeaders } });

hydrateRoot(
  document,
  <StrictMode>
    <HydratedRouter />
  </StrictMode>,
);
