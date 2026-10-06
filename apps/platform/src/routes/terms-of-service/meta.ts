import type { MetaFunction } from 'react-router';
import { pageMetadata } from '../../seo/metadata';

export const termsOfServiceMeta: MetaFunction = () =>
  pageMetadata(
    '/terms-of-service',
    'Terms of Service | Zoff',
    'The terms governing Zoff Music and Watch rooms, shared playback, chat, and supported media providers.',
  );
