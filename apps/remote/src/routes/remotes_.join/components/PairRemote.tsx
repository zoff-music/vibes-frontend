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
    <main className="relative z-10 mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 lg:py-20">
      <section
        className="grid items-center gap-8 lg:grid-cols-2 lg:gap-20"
        aria-labelledby="pair-heading"
      >
        <div className="text-center lg:text-left">
          <p className="font-pixel text-secondary tracking-label text-xs">
            YOUR PLAYER. YOUR CONTROLS.
          </p>
          <h1
            id="pair-heading"
            className="font-display text-theme mt-4 text-3xl sm:text-4xl lg:max-w-sm lg:text-5xl lg:leading-tight"
          >
            Pair a remote.
          </h1>
          <p className="text-theme-muted mx-auto mt-5 max-w-md text-sm leading-relaxed lg:mx-0 lg:text-base">
            Open Remote control on the player, then scan its QR code or enter
            the pairing details here.
          </p>
          <ol className="mt-10 hidden space-y-6 lg:block">
            <li className="flex items-start gap-4">
              <span className="border-secondary/30 bg-secondary/10 text-secondary flex size-9 shrink-0 items-center justify-center rounded-xl border">
                1
              </span>
              <div>
                <p className="text-theme">Open your player</p>
                <p className="text-theme-muted mt-1 text-sm">
                  On the screen you want to control, open Remote control.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="border-secondary/30 bg-secondary/10 text-secondary flex size-9 shrink-0 items-center justify-center rounded-xl border">
                2
              </span>
              <div>
                <p className="text-theme">Connect this device</p>
                <p className="text-theme-muted mt-1 text-sm">
                  Enter its Remote ID and pairing code, or scan the QR code.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="border-primary/30 bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-xl border">
                3
              </span>
              <div>
                <p className="text-theme">You're in control</p>
                <p className="text-theme-muted mt-1 text-sm">
                  Manage playback while the music stays on your player.
                </p>
              </div>
            </li>
          </ol>
        </div>

        <div className="panel-strong border-theme shadow-primary-panel w-full rounded-4xl border p-6 sm:p-8">
          <h2 className="font-display text-theme hidden text-xl lg:block">
            Connect to a player
          </h2>

          {hasPairingLink && (
            <fetcher.Form ref={autoPairFormRef} method="post" className="mt-7">
              <input type="hidden" name="remoteId" value={scannedRemoteId} />
              <input type="hidden" name="pairingToken" value={pairingToken} />
              <div className="border-theme bg-theme-surface rounded-2xl border p-5 text-center">
                {!fetcher.data?.error && (
                  <div className="border-theme border-t-secondary mx-auto h-6 w-6 animate-spin rounded-full border-2" />
                )}
                <p role="status" className="text-theme mt-3 text-sm">
                  {fetcher.data?.error
                    ? 'Pairing unsuccessful'
                    : 'QR code found. Pairing remote…'}
                </p>
                {fetcher.data?.error && (
                  <Link
                    to="/remotes/join"
                    replace
                    className="text-theme focus-visible:ring-secondary mt-4 inline-flex min-h-11 items-center rounded-xl px-4 underline focus-visible:ring-2"
                  >
                    Scan a new code
                  </Link>
                )}
              </div>
            </fetcher.Form>
          )}

          {incompletePairingLink && (
            <p
              role="alert"
              className="text-destructive mt-5 text-center text-sm"
            >
              This pairing link is incomplete. Scan a new QR code or enter the
              details below.
            </p>
          )}

          {!hasPairingLink && (
            <>
              <Button
                type="button"
                className="w-full lg:mt-6"
                onClick={() => setScanning((value) => !value)}
                variant="secondary"
              >
                {scanning ? 'Stop scanning' : 'Scan QR code'}
              </Button>

              <div className="text-theme-muted my-6 flex items-center gap-3 text-xs">
                <span className="border-theme flex-1 border-t" />
                or enter the details
                <span className="border-theme flex-1 border-t" />
              </div>

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
                    <span className="text-theme-muted text-sm">
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
              className="text-destructive mt-4 text-center text-sm"
              role="alert"
            >
              {fetcher.data?.error ?? scanError}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
