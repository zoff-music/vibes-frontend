import { EmbedConfigurator } from '../seo/EmbedConfigurator';

export function EmbedGuide() {
  return (
    <section
      id="embeds"
      aria-labelledby="embed-guide-heading"
      className="border-theme scroll-mt-8 border-t py-16 sm:py-24"
    >
      <p className="font-pixel tracking-label dark:text-secondary text-xs text-cyan-800">
        EMBED SETUP
      </p>
      <h2
        id="embed-guide-heading"
        className="font-pixel mt-4 text-3xl tracking-tight normal-case sm:text-4xl"
      >
        Put your room on a website.
      </h2>
      <p className="text-theme-muted mt-4 max-w-2xl leading-relaxed">
        Let visitors listen and vote without leaving your site. Choose a player,
        a playlist, or both, then try the controls below.
      </p>
      <EmbedConfigurator />
      <ol className="mt-10 grid gap-6 sm:grid-cols-3">
        <li className="border-theme bg-theme-surface rounded-2xl border p-5">
          <span className="font-pixel text-primary text-xs">01</span>
          <h3 className="font-pixel mt-3 text-lg tracking-normal normal-case">
            Open your room
          </h3>
          <p className="text-theme-muted mt-2 text-sm leading-relaxed">
            On a computer, open room settings and choose “Embed player”.
          </p>
        </li>
        <li className="border-theme bg-theme-surface rounded-2xl border p-5">
          <span className="font-pixel text-primary text-xs">02</span>
          <h3 className="font-pixel mt-3 text-lg tracking-normal normal-case">
            Choose the controls
          </h3>
          <p className="text-theme-muted mt-2 text-sm leading-relaxed">
            Set the layout, voting, skipping and autoplay. Pick a light, dark or
            automatic theme.
          </p>
        </li>
        <li className="border-theme bg-theme-surface rounded-2xl border p-5">
          <span className="font-pixel text-primary text-xs">03</span>
          <h3 className="font-pixel mt-3 text-lg tracking-normal normal-case">
            Paste the code
          </h3>
          <p className="text-theme-muted mt-2 text-sm leading-relaxed">
            Copy it into your site’s HTML or embed block. Visitors follow the
            same room and its permissions.
          </p>
        </li>
      </ol>
    </section>
  );
}
