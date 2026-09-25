import { handleServerError } from '@vibes/serve';
import regularFontUrl from '@vibes/ui/shared/fonts/MSW98UI-Regular-latin.woff2?url';
import { renderToReadableStream } from 'react-dom/server';
import type { EntryContext, HandleErrorFunction } from 'react-router';
import { ServerRouter } from 'react-router';
import { robotsDirectives } from './robots';

export const handleError: HandleErrorFunction = handleServerError;

const embedBasePath = `/${(process.env.EMBED_BASE_PATH ?? '/embed').replace(/^\/+|\/+$/g, '')}`;
const fontFilename = regularFontUrl.slice(regularFontUrl.lastIndexOf('/') + 1);
export const documentPreloads = [
  `<${embedBasePath}/assets/${fontFilename}>; rel=preload; as=font; type="font/woff2"; crossorigin`,
];

export default async function handleRequest(
  request: Request,
  statusCode: number,
  headers: Headers,
  context: EntryContext,
) {
  const stream = await renderToReadableStream(
    <ServerRouter context={context} url={request.url} />,
    { signal: request.signal },
  );

  headers.set('Content-Type', 'text/html');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('X-Robots-Tag', robotsDirectives);
  return new Response(stream, { status: statusCode, headers });
}
