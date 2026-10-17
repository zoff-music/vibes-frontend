import type { MetaFunction } from '@kasperrt/smolter/preact';
import { pageMetadata } from '../../seo/metadata';
import { page } from '../../seo/pages/watching';

export const meta: MetaFunction = () =>
  pageMetadata('/discovery/watching', page.title, page.description);
