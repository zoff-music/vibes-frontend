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

Every queue card shows its vote icon and count, including zero votes. Disabling
voting removes the action and invitation to vote, not the existing vote totals.

## Options and verification

Boolean query parameters `player`, `playlist`, `skip`, and `vote` control the
visible content and actions. Room permissions still apply. Embedded playback
requires a visitor interaction.

Check light, dark, and automatic themes with player and playlist together,
player only, playlist only, and voting disabled. Queue cards should retain
their surface and geometry when voting is disabled. Keep the official provider
player's own canvas and controls unchanged.

Before publishing, run `pnpm lint`, `pnpm typecheck`, and the embed build.
