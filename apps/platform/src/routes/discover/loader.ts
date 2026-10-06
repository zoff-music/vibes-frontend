import { type LoaderFunctionArgs, redirect } from 'react-router';
import { productPages } from '../../seo/productPages';
import { watchPages } from '../../seo/watchPages';

export function loader({ params, request }: LoaderFunctionArgs) {
  if (params.topic === 'parties') {
    const { search } = new URL(request.url);
    throw redirect(`/${search}#voting`, 301);
  }
  if (params.topic === 'tvs') {
    const { search } = new URL(request.url);
    throw redirect(`/discovery/apps${search}`, 301);
  }
  const page = [...productPages, ...watchPages].find(
    (candidate) => candidate.slug === params.topic,
  );
  if (!page) {
    throw new Response('Page not found', { status: 404 });
  }
  return { page };
}
