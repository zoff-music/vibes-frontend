import type { MetaFunction } from '@kasperrt/smolter/preact';
import { pageMetadata } from '../../seo/metadata';
import { page } from '../../seo/pages/videos';

export const meta: MetaFunction = () =>
  pageMetadata('/discovery/videos', page.title, page.description);
