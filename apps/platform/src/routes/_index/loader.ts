import type { LoaderFunctionArgs } from 'react-router';
import { getServerApi } from '../../http.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const serverApi = getServerApi(request);
  const [err, stats] = await serverApi.get('/stats', null);
  if (err || !stats) {
    return { totalListeners: 0 };
  }

  return stats;
}
