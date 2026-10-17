import { getRoomLabels } from '@vibes/ui/shared';
import React from 'preact/compat';
import { useCast } from './CastProvider';

export const IdleView: React.FC = () => {
  const { statusText, roomInfo } = useCast();
  const labels = getRoomLabels(roomInfo?.roomType ?? 'MUSIC');

  return (
    <div className="relative z-10 flex max-w-3xl flex-col items-center gap-8 px-6 text-center">
      <div className="w-full rounded-2xl border border-cast-border-strong bg-cast-panel-surface px-10 py-12 shadow-cast dark:border-cast-border-strong-dark dark:bg-cast-panel-surface-dark dark:shadow-cast-dark">
        <div className="mb-6 flex flex-col items-center gap-3">
          <span
            className="font-display text-6xl text-shadow-cast-readable text-text uppercase tracking-logo md:text-7xl dark:text-dark-text"
            data-text="ゾフ"
          >
            ゾフ
          </span>
          <p className="font-mono text-text-subtle text-xs lowercase tracking-banner dark:text-dark-text-subtle">
            zoff
          </p>
        </div>
        <p className="font-display text-2xl text-shadow-cast-readable text-text dark:text-dark-text">
          Add a {labels.item} to start {labels.activity}
        </p>
        <p className="mt-3 text-base text-text-muted dark:text-dark-text-muted">
          {roomInfo
            ? 'Open the room on your phone to build the queue.'
            : statusText}
        </p>
      </div>

      {roomInfo && (
        <div className="w-full rounded-2xl border border-cast-border-strong bg-cast-panel-surface px-8 py-6 shadow-cast dark:border-cast-border-strong-dark dark:bg-cast-panel-surface-dark dark:shadow-cast-dark">
          <p className="font-display text-3xl text-shadow-cast-readable text-text dark:text-dark-text">
            {roomInfo.name}
          </p>
          <div className="mt-3 flex items-center justify-center gap-2 text-text-muted dark:text-dark-text-muted">
            <span className="h-2 w-2 rounded-full bg-secondary" />
            <span className="text-sm uppercase tracking-heading">
              {roomInfo.participantCount} active
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
