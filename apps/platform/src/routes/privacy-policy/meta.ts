import type { MetaFunction } from 'react-router';
import { pageMetadata } from '../../seo/metadata';

export const privacyPolicyMeta: MetaFunction = () =>
  pageMetadata(
    '/privacy-policy',
    'Privacy Policy | Zoff',
    'How Zoff processes room, provider, analytics, and playlist generation data.',
  );
