# Konami UI

`@vibes/ui/konami` is the DOM design system for Zoff OS mode. It owns the
terminal presentation contract so applications compose the mode without
copying colors, borders, focus states, or modal chrome.

Use the package entrypoint:

```tsx
import {
  TerminalButton,
  TerminalField,
  TerminalInput,
  TerminalSection,
} from '@vibes/ui/konami';
```

The package contains controls, feedback, progress, list, modal, toolbar,
section, shell, and room-compiler components. Application code continues to
own routing, cookies, API workflows, and room state.

Advertised function-key controls use `useTerminalShortcuts`. The hook keeps
callbacks current without reinstalling its listener on every render, removes
the listener when its consumer leaves Konami mode, ignores disabled commands,
and yields keyboard priority to open modals.

The boot sequence is intentionally split from the main entrypoint:

```tsx
const { RetroBootExperience } = await import('@vibes/ui/konami/boot');
```

Consumers that render Zoff OS mode must load
`@vibes/ui/konami/styles.css`. The platform app only links that stylesheet
during cookie-enabled SSR, while the lazy boot entry loads it when the secret
sequence is entered for the first time.
