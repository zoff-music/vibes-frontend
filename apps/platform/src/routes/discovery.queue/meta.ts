import type { MetaFunction } from '@kasperrt/smolter/preact';
import { pageMetadata } from '../../seo/metadata';
import { page } from '../../seo/pages/queue';

export const meta: MetaFunction = () =>
  pageMetadata('/discovery/queue', page.title, page.description);
