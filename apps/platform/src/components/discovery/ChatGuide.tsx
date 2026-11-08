import { Link } from '@kasperrt/smolter/preact';
import { ArrowRightIcon, DeferredContent } from '@vibes/ui/web';
import { lazy } from 'preact/compat';

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
        <p className="font-pixel tracking-label dark:text-secondary text-xs text-cyan-800">
          ROOM CHAT
        </p>
        <h2
          id="room-chat-heading"
          className="font-pixel mt-4 text-4xl leading-tight tracking-tight normal-case sm:text-5xl"
        >
          There’s a story
          <br />
          behind that song.
        </h2>
        <p className="text-theme-muted mt-5 max-w-xl leading-relaxed sm:text-lg">
          “Who added this?” becomes part of the conversation. Chat with the room
          and see the picks, votes and skips as they happen.
        </p>
        <p className="text-theme-muted mt-4 text-sm">
          Just here for the music? Turn chat off for your device in Settings.
        </p>
        <Link
          to="/rooms/create"
          prefetch="intent"
          className="border-theme bg-theme-surface text-theme hover:border-secondary/60 hover:bg-theme focus-visible:ring-secondary mt-6 inline-flex min-h-11 items-center gap-3 rounded-xl border px-5 py-3 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
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
              className="border-theme bg-theme h-160 rounded-3xl border"
            />
          }
        >
          <LazyChatPreview />
        </DeferredContent>
      </div>
    </section>
  );
}
