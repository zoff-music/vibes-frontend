import { type LoaderFunctionArgs, redirect } from 'react-router';
import { productPages } from '../../seo/productPages';
import { watchPages } from '../../seo/watchPages';

const watchRedirects: Record<string, string> = {
  'watch-together': 'watching',
  'watch-party': 'cinema',
  'watch-queue': 'videos',
};

export function loader({ params, request }: LoaderFunctionArgs) {
  const topic = params.topic;

  if (topic && Object.hasOwn(watchRedirects, topic)) {
    const { search } = new URL(request.url);

    throw redirect(`/discovery/${watchRedirects[topic]}${search}`, 301);
  }

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
