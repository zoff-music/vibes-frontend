import { type ActionFunctionArgs, redirect } from 'react-router';

export function action({ request }: ActionFunctionArgs) {
  const origin = request.headers.get('origin');

  if (origin && origin !== new URL(request.url).origin) {
    return new Response('Invalid request origin.', { status: 403 });
  }

  return redirect('/remotes/join', {
    headers: {
      'Cache-Control': 'no-store',
      'Set-Cookie':
        'remote_session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict',
    },
  });
}
