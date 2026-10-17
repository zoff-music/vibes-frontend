import { useLoaderData } from '@kasperrt/smolter/preact';
import { TermsOfServiceContent } from './components/TermsOfServiceContent';
import { type TermsOfServiceLoaderData } from './loader';
export const id = 'routes/terms-of-service/route';

export { LegalDocumentFallback as HydrateFallback } from '../../components/legal/LegalDocumentFallback';
export { shouldRevalidate } from '../../components/legal/shouldRevalidate';

export { termsOfServiceMeta as meta } from './meta';

export default function TermsOfService() {
  const loaderData = useLoaderData<TermsOfServiceLoaderData>();

  return (
    <TermsOfServiceContent
      contactEmail={loaderData.contactEmail}
      providers={loaderData.providers}
    />
  );
}

export { loader } from './loader';
