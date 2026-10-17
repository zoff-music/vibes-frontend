# Document resource hints

Production Platform, Admin, Remote and Embed server entries export
`documentPreloads`, using their root stylesheet URL and the same hashed font
URLs rendered by `FontPreloads`. The shared server sends these as `103 Early
Hints` before starting loaders, and merges them into the final `Link` header
without replacing or duplicating matched-route hints. HTML keeps its font
preloads and applying stylesheet links as the fallback.

Cast uses its generated static HTML as the source of truth: only head font
preloads and stylesheets become response hints. It does not eagerly preload
the modern JavaScript bundle into legacy receivers. Chrome 80 legacy output,
polyfills and CSS target remain unchanged.

Hints preserve build-time asset origins and application prefixes, including
custom Embed bases. Fonts use anonymous CORS. SSR stylesheet hints omit CORS
to match their root links; Cast stylesheet hints preserve Vite's `crossorigin`.
The existing asset host continues serving CORS-enabled immutable resources.
Do not add an extra crossorigin mode to only one side of a preload/link pair.

Only HTML GET requests receive document hints. Data endpoints, mutations,
resource routes, static assets and manifests do not receive these speculative
document downloads. No SSR response buffering or HTML rewriting is introduced.
The static document is inspected once at startup, not for each request.

This is preload, not HTTP/2 server push. Browsers and intermediaries can ignore
103, so final headers and HTML remain necessary. Node emitting 103 does not
prove that a production reverse proxy forwards it. Verify the deployed chain
separately; this change does not configure infrastructure.

Samsung Tizen is a packaged-file application with no production HTTP server;
its existing generated stylesheet applies normally. Expo Mobile and Android
TV use native asset loading. HTTP response hints do not apply to these targets.

Run `pnpm --filter @vibes/serve test:preloads` for URL/CORS, header merging,
request eligibility, static-document and pre-loader 103 regressions. Production
verification must also compare hints with actual built HTML and check that
the browser fetches each CSS/font URL only once.
