import { tvPlayerQuerySchema } from '@vibes/models';
import type { LoaderFunctionArgs } from 'react-router';
import playerStyles from './player.css?url';

export function loader({ request }: LoaderFunctionArgs): Response {
  const query = new URL(request.url).searchParams;
  const result = tvPlayerQuerySchema.safeParse({
    video: query.get('video'),
    start: query.get('start') ?? 0,
  });
  if (
    !result.success ||
    query.getAll('video').length !== 1 ||
    query.getAll('start').length > 1
  ) {
    return new Response('Invalid video ID or start time.', {
      status: 400,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const { video, start } = result.data;
  // No hydration or player proxy: YouTube is embedded by this HTTPS document.
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <title>Zoff TV player</title>
  <link rel="stylesheet" href="${playerStyles}">
</head>
<body>
  <iframe title="YouTube player" src="https://www.youtube.com/embed/${video}?autoplay=1&amp;controls=1&amp;playsinline=1&amp;rel=0&amp;start=${start}" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen></iframe>
</body>
</html>`;
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-Robots-Tag': 'noindex, nofollow',
      // This public player must allow file: ancestors with opaque origins.
      // frame-ancestors * does not allow those, so omit that directive here.
      'Content-Security-Policy':
        "default-src 'none'; style-src 'self'; frame-src https://www.youtube.com; base-uri 'none'; form-action 'none'",
    },
  });
}
