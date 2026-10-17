import type { MetaFunction } from '@kasperrt/smolter/preact';
import { pageMetadata } from '../../seo/metadata';
import { page } from '../../seo/pages/rooms';

export const meta: MetaFunction = () =>
  pageMetadata('/discovery/rooms', page.title, page.description);
