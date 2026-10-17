import type { MetaFunction } from '@kasperrt/smolter/preact';
import { pageMetadata } from '../../seo/metadata';
import { page } from '../../seo/pages/cinema';

export const meta: MetaFunction = () =>
  pageMetadata('/discovery/cinema', page.title, page.description);
