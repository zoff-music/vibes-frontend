import { Link } from '@kasperrt/smolter/preact';
import { Button, Input } from '@vibes/ui/web';
import { usePairRemote } from '../hooks/usePairRemote';

export function PairRemote() {
  const {
    fetcher,
    autoPairFormRef,
    videoRef,
    scanning,
    scanError,
    setScanning,
    zoom,
    changeZoom,
    startPinch,
    movePinch,
    endPinch,
    remoteId,
    pairingCode,
    pairingToken,
    scannedRemoteId,
    hasPairingLink,
    incompletePairingLink,
    busy,
    handleRemoteIdChange,
    handlePairingCodeChange,
  } = usePairRemote();

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

        {hasPairingLink && (
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

        {incompletePairingLink && (
          <p role="alert" className="mt-5 text-center text-destructive text-sm">
            This pairing link is incomplete. Scan a new QR code or enter the
            details below.
          </p>
        )}

        {!hasPairingLink && (
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
              <div className="mt-4 space-y-3">
                <div
                  className="aspect-square w-full touch-none overflow-hidden rounded-2xl bg-black"
                  onTouchStart={startPinch}
                  onTouchMove={movePinch}
                  onTouchEnd={endPinch}
                  onTouchCancel={endPinch}
                >
                  <video
                    ref={videoRef}
                    className="h-full w-full object-cover"
                    style={{ transform: `scale(${zoom})` }}
                    muted
                    playsInline
                  />
                </div>
                <div className="flex items-center justify-center gap-4">
                  <Button
                    type="button"
                    variant="tertiary"
                    aria-label="Zoom out"
                    disabled={zoom <= 1}
                    onClick={() => changeZoom(zoom - 0.5)}
                  >
                    −
                  </Button>
                  <span className="text-sm text-theme-muted">
                    {zoom.toFixed(1)}× · Pinch to zoom
                  </span>
                  <Button
                    type="button"
                    variant="tertiary"
                    aria-label="Zoom in"
                    disabled={zoom >= 4}
                    onClick={() => changeZoom(zoom + 0.5)}
                  >
                    +
                  </Button>
                </div>
              </div>
            )}

            <fetcher.Form
              method="post"
              className="mt-6 space-y-4"
              aria-busy={busy}
            >
              <Input
                label="Remote ID"
                name="remoteId"
                autoComplete="off"
                autoCapitalize="none"
                spellcheck={false}
                onChange={handleRemoteIdChange}
                required
                value={remoteId}
              />
              <Input
                label="Pairing code"
                name="pairingCode"
                autoComplete="one-time-code"
                autoCapitalize="characters"
                spellcheck={false}
                onChange={handlePairingCodeChange}
                required
                value={pairingCode}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={busy || !remoteId.trim() || !pairingCode.trim()}
                variant="primary"
              >
                {busy ? 'Pairing…' : 'Pair remote'}
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
