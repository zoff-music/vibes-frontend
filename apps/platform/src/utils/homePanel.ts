import type { HomeLoaderData } from '../routes/_index/loader';

interface RetainedHome {
  experience: string;
  data: HomeLoaderData;
  settings: boolean;
}

let activeHome: RetainedHome | undefined;

// Retain only the mounted homepage, including its pending optional data.
export function retainHomeData(
  experience: string,
  data: HomeLoaderData,
  settings: boolean,
) {
  const owner = { experience, data, settings };
  activeHome = owner;

  return () => {
    if (activeHome === owner) activeHome = undefined;
  };
}

export function getRetainedHomeData(
  experience: string,
  openingSettings: boolean,
) {
  return activeHome?.experience === experience &&
    (openingSettings || activeHome.settings)
    ? activeHome.data
    : undefined;
}

export function homePanelBase(pathname: string) {
  const base = pathname.replace(/\/settings\/device\/?$/, '') || '/';

  if (base === '/' || base === '/features/music' || base === '/features/watch')
    return base;

  return undefined;
}

export function loadDeviceSettings() {
  return import('../components/profile/ProfileSettingsModal');
}
