import { useLoaderData } from '@kasperrt/smolter/preact';
import { SecurityContent } from './components/SecurityContent';
import { type SecurityData } from './loader';

export { LegalDocumentFallback as HydrateFallback } from '../../components/legal/LegalDocumentFallback';
export { shouldRevalidate } from '../../components/legal/shouldRevalidate';

export { securityMeta as meta } from './meta';

export default function Security() {
  const loaderData = useLoaderData<SecurityData>();

  return <SecurityContent securityEmail={loaderData.securityEmail} />;
}

export { loader } from './loader';
