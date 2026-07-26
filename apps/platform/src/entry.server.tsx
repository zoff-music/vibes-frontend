import { handleServerError } from '@vibes/serve';
import { renderToReadableStream } from 'react-dom/server';
import type { EntryContext, HandleErrorFunction } from 'react-router';
import { ServerRouter } from 'react-router';

export const handleError: HandleErrorFunction = handleServerError;

export default async function handleRequest(
  request: Request,
  statusCode: number,
  headers: Headers,
  context: EntryContext,
) {
  const stream = await renderToReadableStream(
    <ServerRouter context={context} url={request.url} />,
    {
      signal: request.signal,
    },
  );

  headers.set('Content-Type', 'text/html');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return new Response(stream, { status: statusCode, headers });
}
