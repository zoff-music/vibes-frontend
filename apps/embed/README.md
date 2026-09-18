# Zoff embed

The standalone React Router SSR embed serves `/embed/:roomName`. Run it with
`pnpm --filter @vibes/embed dev` and build it with
`pnpm --filter @vibes/embed build`.

## Appearance

The `theme` query parameter accepts `light`, `dark`, or `auto`. Auto follows
the visitor's color-scheme preference. The root loader sets the theme before
the page renders, using the shared `@vibes/tailwind` palette.

The iframe owns an opaque `bg-theme` canvas. Its header uses
`bg-theme-elevated`, and queue cards use `bg-theme-surface` whether voting is
enabled or disabled. Do not wrap the whole player in `panel-strong`: its
near-white translucent surface hides the light theme's lavender canvas.

Interactive queue cards use the shared button's `tertiary` variant. Avoid
combining `ghost` with a background utility: `ghost` adds `bg-transparent`,
which can override the intended surface in the generated stylesheet.

Queue cards use `EmbedQueueSong` from `@vibes/ui/web`, shared with the
platform homepage preview. Every queue card shows its vote icon and count, including zero votes. Disabling
voting removes the action and invitation to vote, not the existing vote totals.

## Scrolling inside an iframe

Keep `html`, `body`, and `#root` at the iframe's full height with hidden
overflow and `overscroll-none`. The queue owns its bounded vertical scroll
area in both the combined and playlist-only layouts. Do not let a playlist-only
wrapper grow with the queue and clip later rows outside the iframe.

Set overscroll behavior inside the document, not just on the host's iframe
element. Keep it on the queue too, so reaching either end does not bounce into
blank space or chain wheel/touch scrolling to the surrounding page. Loading
and error content must use the same height boundary.

Keep the queue and vote badges positioned with `relative`. Absolute screen-reader
labels and exiting queue rows must stay inside their local containing blocks;
otherwise invisible content can extend the document's scroll height beyond the
iframe even when its visible ancestors use `overflow-hidden`.

Browser engines can still forward gestures across iframe scroll boundaries,
especially when the content does not overflow. The document-scoped
`useEmbedScrollContainment` hook prevents wheel and single-touch drag defaults
only when a `data-embed-scroll` area cannot scroll further in that direction.
It leaves normal queue scrolling, pinch zoom, and events within provider iframes alone.
Mark any additional internally scrollable area with `data-embed-scroll`.

Verify short and long queues in narrow and wide iframes: the queue must reach
its last song while the embed document and host page remain stationary when
scrolling over it. Scrolling outside the iframe should still work normally.

## Options and verification

Boolean query parameters `player`, `playlist`, `skip`, and `vote` control the
visible content and actions. Room permissions still apply.

Playback waits for a visitor interaction by default. Only `autoplay=true`
opts into unmuted playback on load; omitted, false, or unrecognized values keep
autoplay off. The option has no effect when `player=false`. Autoplay changes
only this embed's local playback, never the room's shared playback state.

Keep `allow="autoplay; encrypted-media"` on the host iframe. The host must permit
autoplay in its Permissions Policy too. Browser policies can still block
audible autoplay: request sound through the official provider SDK, then show
the click-to-play overlay when playback is blocked. Never silently fall back
to muted autoplay or mark an automatic attempt as a visitor gesture.

Check light, dark, and automatic themes with player and playlist together,
player only, playlist only, and voting disabled. Queue cards should retain
their surface and geometry when voting is disabled. Keep the official provider
player's own canvas and controls unchanged.

Before publishing, run `pnpm lint`, `pnpm typecheck`, and the embed build.
