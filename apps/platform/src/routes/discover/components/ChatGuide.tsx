import { ArrowRightIcon, DeferredContent } from '@vibes/ui/web';
import { lazy } from 'react';
import { Link } from 'react-router';

const LazyChatPreview = lazy(() =>
  import('./ChatPreview').then((module) => ({ default: module.ChatPreview })),
);

export function ChatGuide() {
  return (
    <section
      aria-labelledby="room-chat-heading"
      className="grid min-w-0 items-center gap-10 py-16 sm:py-24 lg:grid-cols-5 lg:gap-16"
    >
      <div className="min-w-0 lg:col-span-2">
        <p className="font-pixel text-secondary text-xs tracking-label">
          ROOM CHAT
        </p>
        <h2
          id="room-chat-heading"
          className="mt-4 font-pixel text-4xl normal-case leading-tight tracking-tight sm:text-5xl"
        >
          Good tracks.
          <br />
          Great company.
        </h2>
        <p className="mt-5 max-w-xl text-theme-muted leading-relaxed sm:text-lg">
          Share the song and the conversation. Chat with everyone in your room
          while the music plays, without swapping apps.
        </p>
        <p className="mt-4 max-w-xl text-theme-muted leading-relaxed">
          See who added a song, voted for it or voted to skip. Skips, removals
          and name changes appear in the same conversation. Room admins have a
          crown beside their name.
        </p>
        <p className="mt-4 text-sm text-theme-muted">
          Just here for the music? Turn chat off for your device in Settings.
        </p>
        <Link
          to="/rooms/create"
          className="mt-6 inline-flex min-h-11 items-center gap-3 rounded-xl border border-theme bg-theme-surface px-5 py-3 text-sm text-theme transition-colors hover:border-secondary/60 hover:bg-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
        >
          Bring your people{' '}
          <ArrowRightIcon aria-hidden="true" className="size-4" />
        </Link>
      </div>
      <div id="room-chat-preview" className="min-w-0 lg:col-span-3">
        <DeferredContent
          fallback={
            <div
              aria-hidden="true"
              className="h-144 rounded-3xl border border-theme bg-theme-surface sm:h-156"
            />
          }
        >
          <LazyChatPreview />
        </DeferredContent>
      </div>
    </section>
  );
}
