import { plausibleClient } from '@vibes/api';
import { Button, Input } from '@vibes/ui/web';
import { type ChangeEvent, useEffect, useRef, useState } from 'react';
import { Link, useFetcher, useSearchParams } from 'react-router';
import { clientAction, type PairActionData } from './action';
import { useScanner } from './useScanner';

export { clientAction };

export default function PairRemote() {
  const fetcher = useFetcher<PairActionData>();
  const [searchParams] = useSearchParams();
  const autoPairFormRef = useRef<HTMLFormElement>(null);
  const submittedPairing = useRef('');
  const { videoRef, scanning, scanError, setScanning } = useScanner();
  const [remoteId, setRemoteId] = useState('');
  const [pairingCode, setPairingCode] = useState('');

  const pairingToken = searchParams.get('pair') ?? '';
  const scannedRemoteId = searchParams.get('remoteId') ?? '';

  useEffect(() => {
    void plausibleClient.trackPageview({
      path: '/remotes',
      surface: 'remote',
    });
  }, []);

  useEffect(() => {
    const pairingKey = `${scannedRemoteId}:${pairingToken}`;

    if (
      submittedPairing.current === pairingKey ||
      !pairingToken ||
      !scannedRemoteId ||
      !autoPairFormRef.current
    ) {
      return;
    }
    submittedPairing.current = pairingKey;
    fetcher.submit(autoPairFormRef.current);
  }, [fetcher.submit, pairingToken, scannedRemoteId]);

  const handleRemoteIdChange = (event: ChangeEvent<HTMLInputElement>) => {
    setRemoteId(event.target.value);
  };
  const handlePairingCodeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPairingCode(event.target.value.toUpperCase());
  };

  return (
    <main className="relative z-10 mx-auto w-full max-w-2xl px-5 py-10 sm:px-6 sm:py-16">
      <section className="panel-strong w-full rounded-4xl border border-theme p-6 shadow-primary-panel sm:p-10">
        <div className="text-center">
          <p className="font-pixel text-theme-muted text-xs tracking-label">
            YOUR PHONE. YOUR CONTROLS.
          </p>
          <h1 className="mt-4 font-display text-3xl text-theme sm:text-4xl">
            Pair a remote.
          </h1>
          <p className="mt-3 text-sm text-theme-muted">
            Open Remote control on the player, then scan its QR code or enter
            the pairing details below.
          </p>
        </div>

        {pairingToken && scannedRemoteId && (
          <fetcher.Form ref={autoPairFormRef} method="post" className="mt-7">
            <input type="hidden" name="remoteId" value={scannedRemoteId} />
            <input type="hidden" name="pairingToken" value={pairingToken} />
            <div className="rounded-2xl border border-theme bg-theme-surface p-5 text-center">
              {!fetcher.data?.error && (
                <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-theme border-t-secondary" />
              )}
              <p role="status" className="mt-3 text-sm text-theme">
                {fetcher.data?.error
                  ? 'Pairing unsuccessful'
                  : 'QR code found. Pairing remote…'}
              </p>
              {fetcher.data?.error && (
                <Link
                  to="/remotes/join"
                  replace
                  className="mt-4 inline-flex min-h-11 items-center rounded-xl px-4 text-theme underline focus-visible:ring-2 focus-visible:ring-secondary"
                >
                  Scan a new code
                </Link>
              )}
            </div>
          </fetcher.Form>
        )}

        {!pairingToken && (
          <>
            <Button
              type="button"
              className="mt-7 w-full"
              onClick={() => setScanning((value) => !value)}
              variant="secondary"
            >
              {scanning ? 'Stop scanning' : 'Scan QR code'}
            </Button>

            {scanning && (
              <video
                ref={videoRef}
                className="mt-4 aspect-square w-full rounded-2xl bg-black object-cover"
                muted
                playsInline
              />
            )}

            <fetcher.Form method="post" className="mt-6 space-y-4">
              <Input
                label="Remote ID"
                name="remoteId"
                onChange={handleRemoteIdChange}
                required
                value={remoteId}
              />
              <Input
                label="Pairing code"
                name="pairingCode"
                onChange={handlePairingCodeChange}
                required
                value={pairingCode}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={fetcher.state !== 'idle'}
                variant="primary"
              >
                {fetcher.state !== 'idle' ? 'Pairing…' : 'Pair remote'}
              </Button>
            </fetcher.Form>
          </>
        )}

        {(fetcher.data?.error || scanError) && (
          <p
            aria-live="polite"
            className="mt-4 text-center text-destructive text-sm"
            role="alert"
          >
            {fetcher.data?.error ?? scanError}
          </p>
        )}
      </section>
    </main>
  );
}
