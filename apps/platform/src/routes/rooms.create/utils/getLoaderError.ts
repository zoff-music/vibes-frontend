import { getRateLimitMessage, getRequestErrorMessage } from '@vibes/api';
import type { RoomsCreateLoaderData } from '../loader';

export async function getLoaderError(
  err: Error | null,
  fallbackMessage: string,
): Promise<RoomsCreateLoaderData> {
  const rateLimitMessage = err ? getRateLimitMessage(err) : null;

  return {
    error: await getRequestErrorMessage(err, fallbackMessage),
    ...(rateLimitMessage && { rateLimitMessage }),
  };
}
