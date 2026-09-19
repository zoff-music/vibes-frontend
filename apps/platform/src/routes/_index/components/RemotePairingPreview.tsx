import { classNames } from '@vibes/shared';
import { Button, Input } from '@vibes/ui/web';
import {
  previewPairingCode,
  previewRemoteId,
} from '../hooks/remotePreviewData';

interface RemotePairingPreviewProps {
  animate: boolean;
  code: string;
  connecting: boolean;
  onPair: () => void;
}

export function RemotePairingPreview({
  animate,
  code,
  connecting,
  onPair,
}: RemotePairingPreviewProps) {
  return (
    <div className="flex h-full flex-col justify-center">
      {!connecting && (
        <div>
          <Input label="Remote ID" value={previewRemoteId} readOnly />
          <Input label="Pairing code" value={code} readOnly />
          <Button variant="primary" className="w-full" onClick={onPair}>
            Pair Remote
          </Button>
        </div>
      )}
      {connecting && (
        <div className="rounded-2xl border border-theme bg-theme-surface p-5 text-center">
          <div
            className={classNames(
              'mx-auto h-6 w-6 rounded-full border-2 border-theme border-t-secondary motion-safe:animate-spin',
              !animate && '[animation-play-state:paused]',
            )}
          />
          <p className="mt-3 text-sm text-theme">Pairing remote…</p>
        </div>
      )}
    </div>
  );
}

export function RemotePairingDetails() {
  return (
    <div className="flex h-full items-center">
      <div className="w-full min-w-0 rounded-2xl border border-theme bg-theme-surface p-4 text-center">
        <p className="font-pixel text-theme-muted text-xs tracking-widest">
          Manual pairing
        </p>
        <p className="mt-5 text-theme-muted text-xs">Remote ID</p>
        <p className="mt-2 break-all font-mono text-theme text-xs">
          {previewRemoteId}
        </p>
        <p className="mt-5 text-theme-muted text-xs">Pairing code</p>
        <p className="mt-2 font-display text-2xl text-cyan-700 tracking-widest dark:text-secondary">
          {previewPairingCode}
        </p>
      </div>
    </div>
  );
}
