import { api } from '@vibes/api';
import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HydratedRouter } from 'react-router/dom';

api.config({ fetchOpts: { headers: { 'X-Zoff-Embed': 'true' } } });

hydrateRoot(
  document,
  <StrictMode>
    <HydratedRouter />
  </StrictMode>,
);
