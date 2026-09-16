import type { MetaFunction } from 'react-router';
import { pageMetadata } from '../../seo/metadata';
import type { loader } from './loader';

export const meta: MetaFunction<typeof loader> = ({ loaderData }) => {
  if (!loaderData) {
    return [
      { title: 'Page Not Found | Zoff' },
      { name: 'robots', content: 'noindex' },
    ];
  }
  const { page } = loaderData;
  return pageMetadata(`/discover/${page.slug}`, page.title, page.description);
};
