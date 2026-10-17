import { useLoaderData } from '@kasperrt/smolter/preact';
import { PrivacyPolicyContent } from './components/PrivacyPolicyContent';
import { type PrivacyPolicyLoaderData } from './loader';

export { LegalDocumentFallback as HydrateFallback } from '../../components/legal/LegalDocumentFallback';
export { shouldRevalidate } from '../../components/legal/shouldRevalidate';

export { privacyPolicyMeta as meta } from './meta';

export default function PrivacyPolicy() {
  const loaderData = useLoaderData<PrivacyPolicyLoaderData>();

  return (
    <PrivacyPolicyContent
      privacyEmail={loaderData.privacyEmail}
      providers={loaderData.providers}
    />
  );
}

export { loader } from './loader';
