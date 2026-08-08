import { createApiClient } from '@vibes/api';
import type { ClientLoaderFunctionArgs } from 'react-router';
import { loadController } from './loadController';

export async function clientLoader({ params }: ClientLoaderFunctionArgs) {
  const remoteId = params.id ?? '';
  const client = createApiClient({ 'X-Zoff-Remote-ID': remoteId });
  return loadController(client, remoteId);
}
