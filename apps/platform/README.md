# Vibes Platform

The primary web application for the Vibes ecosystem. It serves as the main interface for users to create rooms, manage queues, and control synchronized playback across devices with full server-side rendering support.

## Visual preview

### Landing page

![Zoff landing page](./docs/screenshots/frontpage.png)

### Active room

![Zoff room with its player and queue](./docs/screenshots/playlist.png)

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

## 🧩 Technical Stack

### Public product pages and search metadata

The homepage and `/rooms/create` have route-specific titles, descriptions,
canonical URLs and social previews. `/discover/listen-together`,
`/discover/shared-music-queue`, `/discover/party-music`, `/discover/music-room`,
`/discover/tv` and `/discover/apps` are server-rendered product pages. The
`/discover/` prefix avoids claiming existing single-segment room names.

Product copy lives in `src/seo/productPages.ts`; adding a page there also adds
its sitemap entry. Keep the lightweight navigation list in
`src/seo/productNavigation.ts` in sync. Keep descriptions factual and public.
`/sitemap.xml` contains only stable product and policy URLs, never live rooms
or session data. `/robots.txt` points to this sitemap. The homepage identifies
the application and its store listings with SoftwareApplication JSON-LD.
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

The homepage combines the room controls, loader-provided community statistics,
short product sections and real app captures. Statistics reuse the homepage
loader's existing `/stats` request; presentation components make no API calls.
Failed statistics requests hide the numbers instead of presenting false zeros.
Keep the first screen focused on room entry and a short product description.
Supporting content and community statistics remain server-rendered below the
hero. `HomeLanding` already renders `ProductIntroduction` for the
normal homepage; the terminal branch renders it separately. Do not duplicate it
in the normal route or remove its `explore-zoff` anchor.
Public room shortcuts appear only when rooms are available, outside the
entry controls. Use the solid tertiary button surface for room rows so the
decorative page grid cannot show through them. Use concise UI and SEO copy
without em dashes.
Keep the free, accountless promise visible beside the main actions in both
homepage entry modes. Room settings and admin passwords belong to each room,
not to a Zoff account; explain that in the existing room-control copy.
`SiteLayout` owns the shared logo header, navigation, personal-settings control
and footer on non-room pages, including error pages. Do not add page-specific
brand variants. `SitePage` owns the common content grid, and `SiteHero` gives the
homepage, guides, policies and room-creation form the same framed surface,
heading scale and padding. The homepage uses its centered desktop layout:
wide headline above a bounded, single-row room-entry strip, with no vertical
divider. The room and playlist-idea fields share the same action-column geometry
to avoid shifting content when changing entry modes. The provider/legal strip
has no separate desktop divider. Guides keep their split desktop layout for
animated previews. Both preserve the
existing mobile stack. Room route IDs explicitly opt out so playback layouts
stay unchanged. Existing terminal screens retain their own terminal chrome.
The perspective grid is shared by the homepage, discovery guides, room-creation
page and security/privacy/terms pages on desktop and mobile. Its route-ID allowlist
excludes both room routes, including party view, so playback never mounts that
background layer. Pause motion in hidden tabs and keep a static grid for reduced
motion. Terminal mode keeps its own background without the grid.

The optimized WebP images in `src/assets/product/` show the `electro` room's
party screen and the mobile App Store search/remote captures. Keep the room
capture at its full aspect ratio, with explicit dimensions and lazy loading.
They are illustrative app captures, not a live room feed.
The social card uses the real circular logo and bundled MSW98UI font;
render its SVG with those local resources embedded when regenerating the PNG.

Discovery pages use topic-specific animated scenes rather than repeating the
same image. They are illustrations and make no provider or generation requests.
Illustrated queue rows reuse the real queue's shared song-artwork fallback,
with explicit image dimensions, rather than inventing new placeholder symbols.
Playlist generation links to `/?mode=ai` for the real homepage action.
Scenes start automatically when visible, pause offscreen or in background tabs,
and expose a pause control. Reduced motion keeps their static poster state.
Keep their geometry stable and animate transforms and opacity instead of layout.
The real circular logo is used in the shared header and as a spinning record label.
All guides use the same ordered navigation, with the current guide highlighted.
Showcases sit inside the shared hero without another outer card. Server-mode
previews advance tracks automatically; host-mode previews show play, pause and
skip commands in a six-second sequence, with a short pause and a visible resume
before skipping. Both reserve the same space when switching modes and respect
the showcase pause/reduced-motion rules. Glow and grid layers fade on all edges
independently of the content; the shared hero, not the inset scene, owns clipping.
Accordion bodies remain in server-rendered HTML while a CSS grid row animates
open and closed, with reduced-motion support. Keep backdrop filters off the
resizing accordion surface so moving neighboring text does not leave paint
trails. Do not animate text opacity while changing the panel's geometry.
Policy pages share the site header and navigation; their document wording and
revision dates must not change as part of presentation-only updates.

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
