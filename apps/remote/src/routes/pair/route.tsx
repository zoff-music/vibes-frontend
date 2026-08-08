import { safeWrap } from '@vibes/shared';
import { Button, Input, RemoteIcon } from '@vibes/ui';
import { type ChangeEvent, useEffect, useRef, useState } from 'react';
import { useFetcher, useNavigate, useSearchParams } from 'react-router';
import { clientAction, type PairActionData } from './action';

export { clientAction };

export default function PairRemote() {
  const fetcher = useFetcher<PairActionData>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const autoPairFormRef = useRef<HTMLFormElement>(null);
  const hasSubmittedPairing = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [remoteId, setRemoteId] = useState('');
  const [pairingCode, setPairingCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState('');

  const pairingToken = searchParams.get('pair') ?? '';
  const scannedRemoteId = searchParams.get('remoteId') ?? '';

  useEffect(() => {
    if (
      hasSubmittedPairing.current ||
      !pairingToken ||
      !scannedRemoteId ||
      !autoPairFormRef.current
    ) {
      return;
    }
    hasSubmittedPairing.current = true;
    fetcher.submit(autoPairFormRef.current);
  }, [fetcher.submit, pairingToken, scannedRemoteId]);

  useEffect(() => {
    if (!scanning || !videoRef.current) return;
    let stream: MediaStream | null = null;
    let frame = 0;
    let active = true;

    const scan = async () => {
      if (!('BarcodeDetector' in window)) {
        setScanError(
          'QR scanning is not supported here. Enter the code instead.',
        );
        setScanning(false);
        return;
      }
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (!active || !videoRef.current) return;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      const detector = new BarcodeDetector({ formats: ['qr_code'] });
      const inspectFrame = async () => {
        if (!active || !videoRef.current) return;
        const results = await detector.detect(videoRef.current);
        const value = results[0]?.rawValue;
        if (value) {
          const [error, url] = safeWrap(() => new URL(value));
          if (!error && url?.origin === window.location.origin) {
            navigate(`${url.pathname}${url.search}`);
            return;
          }
        }
        frame = window.requestAnimationFrame(() => void inspectFrame());
      };
      await inspectFrame();
    };

    void scan().catch(() => {
      setScanError('Could not open the camera. Enter the code instead.');
      setScanning(false);
    });

    return () => {
      active = false;
      window.cancelAnimationFrame(frame);
      stream?.getTracks().forEach((track) => {
        track.stop();
      });
    };
  }, [navigate, scanning]);

  const handleRemoteIdChange = (event: ChangeEvent<HTMLInputElement>) => {
    setRemoteId(event.target.value);
  };
  const handlePairingCodeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPairingCode(event.target.value.toUpperCase());
  };

  return (
    <main className="relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-8">
      <section className="panel-strong w-full max-w-lg rounded-4xl p-6 shadow-primary-panel sm:p-9">
        <div className="text-center">
          <RemoteIcon className="mx-auto h-12 w-12 text-secondary" />
          <h1 className="mt-5 font-display text-2xl text-theme">Zoff Remote</h1>
          <p className="mt-3 text-sm text-theme-muted">
            Scan the QR code shown by the browser you want to control, or enter
            its pairing details.
          </p>
        </div>

        {pairingToken && scannedRemoteId && (
          <fetcher.Form ref={autoPairFormRef} method="post" className="mt-7">
            <input type="hidden" name="remoteId" value={scannedRemoteId} />
            <input type="hidden" name="pairingToken" value={pairingToken} />
            <div className="rounded-2xl border border-theme bg-theme-surface p-5 text-center">
              <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-theme border-t-secondary" />
              <p className="mt-3 text-sm text-theme">Pairing remote…</p>
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
                Pair Remote
              </Button>
            </fetcher.Form>
          </>
        )}

        {(fetcher.data?.error || scanError) && (
          <p className="mt-4 text-center text-destructive text-sm">
            {fetcher.data?.error ?? scanError}
          </p>
        )}
      </section>
    </main>
  );
}

interface BarcodeDetectorResult {
  rawValue: string;
}

declare class BarcodeDetector {
  constructor(options: { formats: string[] });
  detect(source: HTMLVideoElement): Promise<BarcodeDetectorResult[]>;
}
