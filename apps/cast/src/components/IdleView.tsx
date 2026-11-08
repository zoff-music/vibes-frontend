import { getRoomLabels } from '@vibes/ui/shared';
import React from 'preact/compat';
import { useCast } from './CastProvider';

export const IdleView: React.FC = () => {
  const { statusText, roomInfo } = useCast();
  const labels = getRoomLabels(roomInfo?.roomType ?? 'MUSIC');

  return (
    <div className="relative z-10 flex max-w-3xl flex-col items-center gap-8 px-6 text-center">
      <div className="border-cast-border-strong bg-cast-panel-surface shadow-cast dark:border-cast-border-strong-dark dark:bg-cast-panel-surface-dark dark:shadow-cast-dark w-full rounded-2xl border px-10 py-12">
        <div className="mb-6 flex flex-col items-center gap-3">
          <span
            className="font-display text-shadow-cast-readable text-text tracking-logo dark:text-dark-text text-6xl uppercase md:text-7xl"
            data-text="ゾフ"
          >
            ゾフ
          </span>
          <p className="text-text-subtle tracking-banner dark:text-dark-text-subtle font-mono text-xs lowercase">
            zoff
          </p>
        </div>
        <p className="font-display text-shadow-cast-readable text-text dark:text-dark-text text-2xl">
          Add a {labels.item} to start {labels.activity}
        </p>
        <p className="text-text-muted dark:text-dark-text-muted mt-3 text-base">
          {roomInfo
            ? 'Open the room on your phone to build the queue.'
            : statusText}
        </p>
      </div>

      {roomInfo && (
        <div className="border-cast-border-strong bg-cast-panel-surface shadow-cast dark:border-cast-border-strong-dark dark:bg-cast-panel-surface-dark dark:shadow-cast-dark w-full rounded-2xl border px-8 py-6">
          <p className="font-display text-shadow-cast-readable text-text dark:text-dark-text text-3xl">
            {roomInfo.name}
          </p>
          <div className="text-text-muted dark:text-dark-text-muted mt-3 flex items-center justify-center gap-2">
            <span className="bg-secondary h-2 w-2 rounded-full" />
            <span className="tracking-heading text-sm uppercase">
              {roomInfo.participantCount} active
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
