import { type LoaderFunctionArgs, redirect } from '@kasperrt/smolter/preact';

export function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  return redirect(`/remotes/join${url.search}`);
}
