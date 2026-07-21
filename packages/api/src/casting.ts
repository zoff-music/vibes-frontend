import type { CastingTokenResponse } from '@vibes/models';
import { api } from './index';

export async function createCastingToken(
  roomId: string,
): Promise<[Error | null, CastingTokenResponse | null]> {
  return api.post('/tokens/casting', null, { roomId });
}
