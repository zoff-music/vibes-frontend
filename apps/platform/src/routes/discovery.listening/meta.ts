import type { MetaFunction } from '@kasperrt/smolter/preact';
import { pageMetadata } from '../../seo/metadata';
import { page } from '../../seo/pages/listening';

export const meta: MetaFunction = () =>
  pageMetadata('/discovery/listening', page.title, page.description);
