# @vibes/tailwind

Shared Tailwind configuration for every Vibes frontend app.

Tailwind CSS 4 supports JavaScript compatibility configs when they are loaded
explicitly with `@config`. App stylesheets point directly at the configs in this
package so themes, utilities, and variants have one source of truth.

- `config.js` is the shared platform, embed, and admin theme.
- `cast.config.js` contains the receiver-specific theme in the same package.
- `vibes-plugin.mjs` contains the shared custom utilities.
