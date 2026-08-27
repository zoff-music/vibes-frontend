import { createNativeRouter, RouterProvider } from '@vibes/native-router';
import type { PropsWithChildren } from 'react';
import { useState } from 'react';
import { createRouteManifest } from './manifest';

export function AppRouterProvider({ children }: PropsWithChildren) {
  const [router] = useState(() => createNativeRouter(createRouteManifest()));
  return (
    <RouterProvider initialMatches={initialMatches} router={router}>
      {children}
    </RouterProvider>
  );
}

const initialMatches = [
  { routeId: 'preferences.konami' },
  { routeId: 'preferences.theme' },
  { routeId: 'preferences.player' },
  { routeId: '_index' },
  { routeId: 'remotes.session' },
] as const;
