import { useLoaderData } from 'react-router';
import { PrivacyPolicyHydrateFallback } from './components/HydrateFallback';
import { PrivacyPolicyContent } from './components/PrivacyPolicyContent';
import { type PrivacyPolicyLoaderData, privacyPolicyLoader } from './loader';
import { privacyPolicyMeta } from './meta';

export const HydrateFallback = PrivacyPolicyHydrateFallback;

export const loader = privacyPolicyLoader;

export const meta = privacyPolicyMeta;

export default function PrivacyPolicy() {
  const loaderData = useLoaderData<PrivacyPolicyLoaderData>();

  return (
    <PrivacyPolicyContent
      privacyEmail={loaderData.privacyEmail}
      providers={loaderData.providers}
    />
  );
}
