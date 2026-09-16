import type { LoaderFunctionArgs } from 'react-router';
import { productPages } from '../../seo/productPages';

export function loader({ params }: LoaderFunctionArgs) {
  const page = productPages.find(
    (candidate) => candidate.slug === params.topic,
  );
  if (!page) {
    throw new Response('Page not found', { status: 404 });
  }
  return { page };
}
