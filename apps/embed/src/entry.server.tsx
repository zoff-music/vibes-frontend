import { renderToReadableStream } from 'react-dom/server';
import type { EntryContext } from 'react-router';
import { ServerRouter } from 'react-router';
import { robotsDirectives } from './robots';

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
  headers.set('X-Robots-Tag', robotsDirectives);
  return new Response(stream, { status: statusCode, headers });
}
