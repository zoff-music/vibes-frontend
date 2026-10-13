import { type LoaderFunctionArgs, redirect } from 'react-router';

export function loader({
  params,
  request,
}: Pick<LoaderFunctionArgs, 'params' | 'request'>) {
  if (!params.id) {
    return redirect('/');
  }

  const url = new URL(request.url);
  return redirect(`/${encodeURIComponent(params.id)}${url.search}`);
}
