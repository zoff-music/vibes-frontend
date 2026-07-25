import { useLoaderData } from 'react-router';
import { TermsOfServiceHydrateFallback } from './components/HydrateFallback';
import { TermsOfServiceContent } from './components/TermsOfServiceContent';
import { type TermsOfServiceLoaderData, termsOfServiceLoader } from './loader';
import { termsOfServiceMeta } from './meta';

export const HydrateFallback = TermsOfServiceHydrateFallback;

export const loader = termsOfServiceLoader;

export const meta = termsOfServiceMeta;

export default function TermsOfService() {
  const loaderData = useLoaderData<TermsOfServiceLoaderData>();

  return <TermsOfServiceContent providers={loaderData.providers} />;
}
