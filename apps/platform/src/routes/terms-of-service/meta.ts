import type { MetaFunction } from 'react-router';
import { pageMetadata } from '../../seo/metadata';

export const termsOfServiceMeta: MetaFunction = () =>
  pageMetadata(
    '/terms-of-service',
    'Terms of Service | Zoff',
    'The terms governing use of Zoff and its supported music providers.',
  );
