# @vibes/tailwind

Shared Tailwind configuration for every Vibes frontend app.

Tailwind CSS 4 supports JavaScript compatibility configs when they are loaded
explicitly with `@config`. Apps import the compiled entry stylesheets from this
package so configs, themes, base styles, utilities, and variants have one source
of truth.

- `config.js` is the shared platform, embed, and admin theme.
- `cast.config.js` contains the receiver-specific theme in the same package.
- `vibes-plugin.mjs` contains the shared custom utilities.
- `styles.css` is the shared platform, embed, and admin Tailwind entrypoint.
- The receiver imports the shared theme and fonts from its Tailwind entrypoint.
  Its components use Tailwind utilities, including responsive variants; there is no separate component stylesheet.
