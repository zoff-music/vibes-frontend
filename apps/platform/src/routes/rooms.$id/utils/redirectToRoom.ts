import { type LoaderFunctionArgs, redirect } from '@kasperrt/smolter/preact';

export function redirectToRoom({
  params,
  request,
}: Pick<LoaderFunctionArgs, 'params' | 'request'>) {
  if (!params.id) {
    return redirect('/');
  }

  const url = new URL(request.url);

  return redirect(`/${encodeURIComponent(params.id)}${url.search}`);
}
