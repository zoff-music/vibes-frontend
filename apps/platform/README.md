# Vibes Platform

The primary web application for the Vibes ecosystem. It serves as the main interface for users to create rooms, manage queues, and control synchronized playback across devices with full server-side rendering support.

## Embed sharing

The room's **Embed player** settings include an **Autoplay** toggle, off by
default. Enabling it adds `autoplay=true` to the embed URL, keeps the iframe's
`allow="autoplay; encrypted-media"` permission, and uses eager loading so the
player can start when the host page loads. Disabling the player also disables
autoplay in the generated code. Existing embeds remain click-to-play.

Autoplay requests sound, not muted playback. Browsers and host-page permissions
can still require a click; keep that limitation visible beside the toggle.

## Room playback

Joining a room automatically requests playback with sound through the existing
YouTube and SoundCloud players, following the room's current playback state.
Keep saved volume and mute preferences, local pauses, and paused host rooms
intact. Do not send room-wide play commands just because a listener joins.
Browser-blocked autoplay keeps the click-to-play fallback. Embed autoplay is
still a separate, default-off sharing option.

## Visual preview

### Landing page

![Zoff landing page](./docs/screenshots/frontpage.jpg)

### Active room

![Zoff room with its player and queue](./docs/screenshots/playlist.jpg)

## 🚀 Getting Started

### Local Development
The platform app runs on port 3001 with SSR support.

```sh
pnpm install
pnpm --filter @vibes/platform dev
```

**App URL**: `http://localhost:3001`

### Development Scripts

```bash
# Development with SSR and HMR
pnpm dev

# Production build
pnpm build

# Type checking
pnpm typecheck

# Linting and formatting
pnpm lint

# Testing
pnpm test
```

## 🛠 Features

- **Collaborative Queue**: Real-time voting, reordering, and removal of tracks
- **Smart Search**: Unified search across YouTube and SoundCloud with debouncing and autocomplete
- **Synchronized Playback**: Leveraging Server-Sent Events (SSE) to keep all participants in perfect sync
- **Device Management**: Seamlessly switch playback between your browser and local Chromecast devices
- **Social Integration**: Shareable room links and generated QR codes for easy joining
- **Server-Side Rendering**: Fast initial page loads with intelligent data prefetching

## 🏗 Architecture

### Server-Side Rendering (SSR)
The platform app includes comprehensive SSR support via `server.tsx`:

- **React 19 SSR**: Uses `renderToReadableStream` for streaming HTML responses
- **Smart Data Prefetching**: Automatically fetches room data for `/room/{id}` routes
- **Intelligent Redirects**: Non-existent rooms redirect to create page with pre-filled name
- **Static File Serving**: Handles both development and production asset serving
- **Hot Module Replacement**: WebSocket-based HMR for instant development feedback

### Data Flow
1. **Initial Request**: Server pre-fetches room data if available
2. **SSR Rendering**: React renders with initial data, preventing loading states
3. **Client Hydration**: React takes over with pre-populated stores
4. **Real-time Updates**: SSE maintains synchronization after hydration

The v2 `song_updated` event inserts missing songs or repositions existing songs
at the backend-provided index. It also carries manually added songs, whose
automatic vote may place them ahead of the unvoted queue. Show the addition
notification only when the song is absent before applying that event, so votes
and replayed updates do not produce duplicate addition notifications.

### Route Handling
- **`/`**: Home page with room creation and joining
- **`/room/create`**: Room creation with optional `?name=` parameter
- **`/room/{id}`**: Room view with server-side room data fetching
- **Non-existent rooms**: Automatic redirect to create page with suggested name

## Missing pages

![Zoff 404 page with the Repeat the Beat mini-game](./docs/screenshots/not-found.jpg)

Unmatched paths and unknown discovery guides return a real HTTP 404 with
`noindex` metadata. The shared `NotFoundView` keeps the page on brand; the
platform adds a small, local-only memory game using shared buttons. It starts
on demand, supports touch and number keys 1–4, and pauses offscreen or in hidden
tabs. Reduced motion shows the pattern without flashing and lets the player
choose when to continue. Single-segment room names keep their existing room
creation flow. Other failures retain their retry screen.

## 🧩 Technical Stack

### Public product pages and search metadata

The homepage and `/rooms/create` have route-specific titles, descriptions,
canonical URLs and social previews. `/discovery/listening`,
`/discovery/queue`, `/discovery/rooms`,
`/discovery/apps` are server-rendered product pages. The apps guide includes
TV, casting and phone remotes; `/discovery/tvs` and `/discover/tv` permanently
redirect there. Explore uses four cards in a two-column grid. The
`/discovery/` prefix avoids claiming existing single-segment room names.

The previous `/discover/` URLs permanently redirect to the corresponding
`/discovery/` page, preserving query parameters. The party guide is folded into
the homepage voting demo: `/discover/party-music` and `/discovery/parties`
redirect directly to `/#voting`, preserving query parameters. Navigation,
canonical URLs,
structured data and the sitemap use only the new paths. Unknown guide names
return 404.

Product copy lives in `src/seo/productPages.ts`; adding a page there also adds
its sitemap entry. Keep the lightweight navigation list in
`src/seo/productNavigation.ts` in sync. Keep descriptions factual and public.
`/sitemap.xml` contains only stable product and policy URLs, never live rooms
or session data. `/robots.txt` points to this sitemap. The homepage identifies
the application and its store listings with SoftwareApplication JSON-LD.
All these public pages also use server-rendered WebSite and WebPage JSON-LD,
with stable canonical `@id` references to the same website and application.
Non-home pages have a two-step BreadcrumbList from the homepage to the current
page, matching the site's actual navigation without inventing an intermediate
`/discovery` landing page. Descriptions reuse the page's existing metadata.
Keep query parameters out of these identities, including room-name prefill.
Do not add this product markup to live rooms, embeds, operational routes, or
error pages. Do not invent ratings, reviews, or unsupported search actions.
The application identity is valid Schema.org markup; Google software-app rich
results additionally require genuine rating/review data, which Zoff does not
currently publish on these pages. Structured data does not guarantee a rich
result. Follow the [Google structured data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
and [software-app requirements](https://developers.google.com/search/docs/appearance/structured-data/software-app).
Actual room pages use `noindex, follow`, including party/share variants and
the missing-loader-data fallback, while retaining their social-preview metadata.
Keep room URLs crawlable in `robots.txt` so crawlers can read the directive.
Room-creation URLs with `?name=` retain their form prefill and declare the clean
`https://zoff.me/rooms/create` URL as canonical. Do not remove useful query
parameters or apply `noindex` to these alternate product-page URLs.

Social metadata uses a content-hashed PNG from `src/assets/social-card.png`;
its editable vector source is alongside it. Regenerate the PNG at 1200×630
after changing the SVG. Verify page metadata in server-rendered HTML, including
canonical URLs without tracking parameters, rather than relying on hydration.

The homepage uses alternating product sections for voting, room controls,
AI playlist generation and remote control. App screenshots stay on the apps
guide, and the embed configurator stays on the rooms guide. Community totals come from the existing
loader and sit above the queue section, aligned with the same content width.
Failed requests show
unavailable values, not false zeros. Keep copy short and avoid repeating the
same explanation in adjacent sections.

Product demos use placeholder songs and artwork in a room named `electro`.
Reuse `QueueItem`, `NowPlayingSong`, `PlaybackProgress`, `EmbedQueueSong` and
`SegmentedToggle` from `@vibes/ui/web`. Demo state stays in app-owned hooks;
it never sends provider requests or changes a real room. Do not introduce
alternate players, queue rows, equalizers or toggle implementations. Keep
provider links disabled for placeholder songs. The queue and playlist demos
use Framer Motion; playback follows local timers. All automatic motion pauses
offscreen and in hidden tabs and respects reduced motion. Lower-page demos
and app screenshots mount through `DeferredContent` near the viewport; keep
their headings, descriptions and navigation server-rendered. Reserve preview
space while loading so scrolling remains stable. The hero typing effect and
sun also pause when out of view.

The generated playlist showcase types a prompt, shows the shared
`GenerationSparkles` from the real room-generation screen, then adds three
placeholder tracks to the queue. Selecting an idea restarts at the prompt;
reduced motion shows the completed example without typing or transitions.
The homepage entry button opens and focuses the real generator without
submitting a request. Keep the feature copy and guide links server-rendered.

The remote showcase first displays the player's pairing details, enters the
matching code on the phone and transitions into the connected controls. Run it
once, retain the usable remote afterward, and offer pause/replay controls.
Reduced motion leaves pairing manual. All IDs, codes and playback in this demo
are local placeholders; never issue a real pairing request from the showcase.

The shared embed configurator exposes player, playlist, voting, skipping and
autoplay. Keep its small artwork and two queue rows visible without inner
scrolling. Its height matches the settings panel on desktop, and both panels
stack on mobile. The room guide contains setup steps; generated iframe code
belongs only in the real room's embed settings.

Keep all static presentation in Tailwind utilities and shared Tailwind
configuration. Discovery previews have no separate stylesheet. Accordion
content remains in server-rendered HTML, without height or text-opacity
animation. Background decorations must not widen the document or intercept
scrolling. The hero, guides and product sections use the common site layout;
room routes keep their player layout. The old `how-it-works` anchor remains
compatible without a separate jump link.

Optional session, remote and homepage reads do not retry during SSR. Preserve
request cancellation and timeouts. The local pixel font is preloaded, and the
shared server compresses production responses. Do not introduce external font
stylesheets or request backoff delays on public page loads.

The mobile search and remote pairing captures live in `src/assets/product/`.
Documentation screenshots live in `docs/screenshots/`; refresh them from the
actual browser UI and keep the organization profile in `zoff-music/.github`
in sync. Retain explicit image dimensions and lazy loading where appropriate.
The social-card SVG uses the circular logo and bundled MSW98UI font.

`SiteLayout` owns the shared header, navigation, personal settings and footer.
`SitePage` owns the content grid; `SiteHero` supplies the common heading scale,
spacing and framed surface. The homepage keeps a centered room-entry form;
guides split their content and preview when space allows. Terminal mode keeps
its own chrome and theme. Policy wording and revision dates must not change as
part of presentation work.

Desktop rooms use the available viewport space below the header, rather than
subtracting a cached header measurement. The player has a shrinkable media row
and a separate, content-sized control row in normal and party views. Keep the
provider mounted when changing views. Header measurement belongs to the header's
own lifecycle and is used only to position mobile share/settings panels; clear
it when the header unmounts and measure again when it returns.

- **Framework**: React 19 + TypeScript with SSR streaming
- **Runtime**: Node.js for production serving
- **State Management**: Zustand for high-performance, selective store subscriptions (playback, UI, auth)
- **Styling**: Tailwind CSS v4 with custom "retro-futuristic" design system and enhanced dark mode
- **API Engine**: `@vibes/api` for type-safe, validated request/response handling
- **Real-time**: Typed SSE subscriptions through `@vibes/api`
- **Build Tool**: Vite with React 19 optimizations and SSR support

## 📁 Source Structure

- `src/routes`: React Router route modules and colocated route workflows
- `src/components`: Platform-specific room, queue, casting, and layout components
- `src/hooks`: Platform workflows built on the shared typed API
- `server`: Production server entrypoint and SSR asset handling
- `@vibes/ui/web`: Shared DOM controls and provider players
- `@vibes/api`: Typed REST and SSE boundary

## 🔧 Environment Configuration

The platform app supports various environment variables:

```bash
# API Configuration
VITE_API_URL=http://localhost:8080

# Cast Configuration (inherited from root)
VITE_CAST_APP_ID=1FAF5D9F
VITE_CAST_RECEIVER_URL=/casting/receiver/

# Development
NODE_ENV=development|production
PORT=3000
```

## 🚀 Performance Features

- **SSR Streaming**: Immediate HTML delivery with progressive enhancement
- **Smart Prefetching**: Room data loaded server-side to eliminate loading states
- **Optimized Bundles**: Vite code splitting and tree shaking
- **Hot Module Replacement**: Sub-second development feedback
- **Zustand Optimization**: Selective subscriptions prevent unnecessary re-renders
