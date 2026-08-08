import { api, getAPIErrorMessage, getRateLimitMessage } from '@vibes/api';
import type { ClientActionFunctionArgs } from 'react-router';
import { redirect } from 'react-router';

export interface PairActionData {
  error?: string;
}

export async function clientAction({ request }: ClientActionFunctionArgs) {
  const formData = await request.formData();
  const remoteId = String(formData.get('remoteId') ?? '').trim();
  const pairingCode = String(formData.get('pairingCode') ?? '').trim();
  const pairingToken = String(formData.get('pairingToken') ?? '').trim();

  if (!remoteId || (!pairingCode && !pairingToken)) {
    return { error: 'Enter the remote ID and pairing code.' };
  }

  const [error, remote] = await api.post(
    '/remotes/{id}/sessions',
    { id: remoteId },
    { pairingCode, pairingToken },
  );
  if (error || !remote) {
    return {
      error:
        (error && getRateLimitMessage(error)) ??
        (error ? await getAPIErrorMessage(error) : null) ??
        'That pairing is invalid or expired.',
    } satisfies PairActionData;
  }

  return redirect(`/remotes/${encodeURIComponent(remoteId)}`);
}
