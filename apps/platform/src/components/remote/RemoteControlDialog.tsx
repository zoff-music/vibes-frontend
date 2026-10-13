import type { RemotePairingV2, RemoteStatusV2 } from '@vibes/models';
import {
  TerminalButton,
  TerminalFeedback,
  TerminalModal,
  TerminalSection,
  TerminalStatus,
  TerminalStatusGrid,
  terminalButtonClassName,
} from '@vibes/ui/konami';
import { Button, CloseIcon, Modal, RemoteIcon } from '@vibes/ui/web';
import { QRCodeSVG } from 'qrcode.react';
import { Suspense } from 'react';
import { type FetcherWithComponents, Link } from 'react-router';
import type { RemoteControlActionData } from '../../routes/remote-control/action';

interface RemoteControlDialogProps {
  controlFetcher: FetcherWithComponents<RemoteControlActionData>;
  remote: RemoteStatusV2;
  pairing: RemotePairingV2 | null;
  machineRoomId: string;
  terminalMode: boolean;
  isOpen: boolean;
  closeRemoteControl: () => void;
}

export function RemoteControlDialog({
  controlFetcher,
  remote,
  pairing,
  machineRoomId,
  terminalMode,
  isOpen,
  closeRemoteControl,
}: RemoteControlDialogProps) {
  const pairingUrl = pairing
    ? `${window.location.origin}/remotes/join?remoteId=${encodeURIComponent(pairing.id)}&pair=${encodeURIComponent(pairing.pairingToken)}`
    : '';

  return (
    <Suspense
      fallback={
        <p role="status" className="sr-only">
          Loading remote controls...
        </p>
      }
    >
      {terminalMode && isOpen && (
        <TerminalModal
          ariaLabelledBy="remote-control-title"
          className="!max-w-xl"
          isOpen={isOpen}
          onClose={closeRemoteControl}
          size="sm"
          title="REMOTE LINK DAEMON"
        >
          <TerminalStatusGrid className="mb-4">
            <TerminalStatus
              label="DAEMON STATUS"
              value={remote.enabled ? 'ONLINE' : 'OFFLINE'}
            />
            <TerminalStatus
              label="PAIR STATUS"
              value={remote.paired ? 'LINKED' : 'WAITING'}
            />
            <TerminalStatus
              label="ROOM CHANNEL"
              value={machineRoomId || 'NONE'}
            />
          </TerminalStatusGrid>

          {pairing && (
            <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
              <div className="bg-white p-2">
                <QRCodeSVG
                  bgColor="#ffffff"
                  fgColor="#03150d"
                  level="H"
                  marginSize={2}
                  size={180}
                  title="Pair Zoff remote"
                  value={pairingUrl}
                />
              </div>
              <TerminalSection label="MANUAL PAIRING CODE" status="ARMED">
                <p className="mt-3 text-3xl text-[#e0ffef] tracking-[0.18em]">
                  {pairing.pairingCode}
                </p>
                <p className="mt-3 break-all text-[#a6ffd0]/45 text-[0.58rem]">
                  ID {pairing.id}
                </p>
                <p className="mt-4 text-[#71f5ad] text-xs">
                  ONE-TIME KEY ARMED. AWAITING CONTROLLER.
                  <span className="terminal-cursor">_</span>
                </p>
              </TerminalSection>
            </div>
          )}

          {!pairing && remote.enabled && (
            <TerminalFeedback>
              REMOTE CONTROL IS ACTIVE. GENERATE A NEW PAIRING KEY TO LINK
              ANOTHER DEVICE.
            </TerminalFeedback>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <controlFetcher.Form action="/remote-control" method="post">
              <input type="hidden" name="intent" value="enable" />
              <input type="hidden" name="roomId" value={machineRoomId} />
              <TerminalButton
                disabled={controlFetcher.state !== 'idle'}
                type="submit"
              >
                {remote.enabled ? '[ NEW PAIRING ]' : '[ ENABLE REMOTE ]'}
              </TerminalButton>
            </controlFetcher.Form>
            {remote.enabled && (
              <controlFetcher.Form action="/remote-control" method="post">
                <input type="hidden" name="intent" value="delete" />
                <input type="hidden" name="remoteId" value={remote.id} />
                <TerminalButton
                  disabled={controlFetcher.state !== 'idle'}
                  type="submit"
                >
                  [ DISABLE ]
                </TerminalButton>
              </controlFetcher.Form>
            )}
            <Link
              className={terminalButtonClassName()}
              reloadDocument
              to="/remotes/join"
            >
              [ CONNECT AS REMOTE ]
            </Link>
          </div>
        </TerminalModal>
      )}
      {!terminalMode && isOpen && (
        <Modal
          ariaLabelledBy="remote-control-title"
          isOpen={isOpen}
          onClose={closeRemoteControl}
          size="sm"
        >
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2
                id="remote-control-title"
                className="font-display text-lg text-theme"
              >
                Remote Control
              </h2>
              <p className="mt-2 text-sm text-theme-muted">
                Pair another device to control this browser. Disabling remote
                control revokes access immediately.
              </p>
            </div>
            <Button
              type="button"
              onClick={closeRemoteControl}
              variant="ghost"
              size="icon"
              aria-label="Close remote control"
            >
              <CloseIcon className="h-5 w-5" />
            </Button>
          </div>

          {pairing && (
            <div className="space-y-5 text-center">
              <div className="inline-flex rounded-2xl bg-white p-3">
                <QRCodeSVG
                  value={pairingUrl}
                  size={220}
                  bgColor="#ffffff"
                  fgColor="#2a1840"
                  level="H"
                  marginSize={3}
                  title="Pair Zoff remote"
                  imageSettings={{
                    src: platformLogoUrl,
                    height: 40,
                    width: 40,
                    excavate: true,
                  }}
                />
              </div>
              <div className="rounded-2xl border border-theme bg-theme-surface p-4">
                <p className="font-pixel text-2xs text-theme-muted tracking-label">
                  Manual pairing
                </p>
                <p className="mt-3 break-all font-mono text-theme text-xs">
                  {pairing.id}
                </p>
                <p className="mt-3 font-display text-2xl text-secondary tracking-widest">
                  {pairing.pairingCode}
                </p>
              </div>
              <p className="text-theme-subtle text-xs">
                This pairing expires shortly and can only be used once.
              </p>
            </div>
          )}

          {!pairing && remote.enabled && (
            <div className="rounded-2xl border border-theme bg-theme-surface p-5 text-center">
              <RemoteIcon className="mx-auto h-10 w-10 text-secondary" />
              {remote.paired && (
                <>
                  <p className="mt-3 font-display text-sm text-theme">
                    Remote paired
                  </p>
                  <p className="mt-2 text-theme-muted text-xs">
                    The one-time pairing has been used. The paired device can
                    now control this browser until remote control is disabled or
                    replaced.
                  </p>
                </>
              )}
              {!remote.paired && (
                <>
                  <p className="mt-3 font-display text-sm text-theme">
                    Remote control enabled
                  </p>
                  <p className="mt-2 text-theme-muted text-xs">
                    Create a new one-time pairing to connect another device.
                  </p>
                </>
              )}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <controlFetcher.Form
              action="/remote-control"
              method="post"
              className="flex-1"
            >
              <input type="hidden" name="intent" value="enable" />
              <input type="hidden" name="roomId" value={machineRoomId} />
              <Button
                type="submit"
                className="w-full gap-3 whitespace-nowrap"
                variant="secondary"
                disabled={controlFetcher.state !== 'idle'}
              >
                <RemoteIcon className="h-5 w-5" />
                {remote.enabled ? 'New Pairing' : 'Enable Remote'}
              </Button>
            </controlFetcher.Form>

            {remote.enabled && (
              <controlFetcher.Form
                action="/remote-control"
                method="post"
                className="flex-1"
              >
                <input type="hidden" name="intent" value="delete" />
                <input type="hidden" name="remoteId" value={remote.id} />
                <Button
                  type="submit"
                  className="w-full"
                  variant="destructive"
                  disabled={controlFetcher.state !== 'idle'}
                >
                  Disable
                </Button>
              </controlFetcher.Form>
            )}
          </div>
          <div className="mt-3 border-theme border-t pt-3">
            <Link
              to="/remotes/join"
              reloadDocument
              className="inline-flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-theme bg-theme-surface px-5 py-2.5 font-normal text-base text-theme transition-all hover:border-theme-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-theme active:scale-press"
            >
              <RemoteIcon className="h-5 w-5" />
              Connect as a Remote
            </Link>
          </div>
        </Modal>
      )}
    </Suspense>
  );
}

const platformLogoUrl = `${import.meta.env.BASE_URL}logo.png`;
