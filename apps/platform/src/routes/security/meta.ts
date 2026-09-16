import type { MetaFunction } from 'react-router';
import { pageMetadata } from '../../seo/metadata';

export const securityMeta: MetaFunction = () =>
  pageMetadata(
    '/security',
    'Security Policy | Zoff',
    'How to report security vulnerabilities to Zoff and the rules for good-faith research.',
  );
