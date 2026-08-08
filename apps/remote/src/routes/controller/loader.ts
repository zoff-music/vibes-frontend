import type { LoaderFunctionArgs } from 'react-router';
import { getServerApi } from '../../http.server';
import { loadController } from './loadController';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const remoteId = params.id ?? '';
  const cookie = request.headers.get('cookie') ?? '';
  const client = getServerApi();
  return loadController(client, remoteId, {
    Cookie: cookie,
    'X-Zoff-Remote-ID': remoteId,
  });
}
