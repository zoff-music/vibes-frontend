import type { MetaFunction } from 'react-router';
import { pageMetadata } from '../../seo/metadata';

export const privacyPolicyMeta: MetaFunction = () =>
  pageMetadata(
    '/privacy-policy',
    'Privacy Policy | Zoff',
    'How Zoff processes Music and Watch room data, provider information, chat, analytics, and AI playlist prompts.',
  );
