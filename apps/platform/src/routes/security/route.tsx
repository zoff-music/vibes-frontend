import { useLoaderData } from 'react-router';
import { SecurityHydrateFallback } from './components/HydrateFallback';
import { SecurityContent } from './components/SecurityContent';
import { type SecurityData, securityLoader } from './loader';
import { securityMeta } from './meta';

export const HydrateFallback = SecurityHydrateFallback;

export const loader = securityLoader;

export const meta = securityMeta;

export default function Security() {
  const loaderData = useLoaderData<SecurityData>();

  return <SecurityContent securityEmail={loaderData.securityEmail} />;
}
