import type { MetaFunction } from '@kasperrt/smolter/preact';
import { pageMetadata } from '../../seo/metadata';
import { page } from '../../seo/pages/apps';

export const meta: MetaFunction = () =>
  pageMetadata('/discovery/apps', page.title, page.description);
