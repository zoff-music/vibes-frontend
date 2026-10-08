import { EmbedConfigurator } from '../../../components/seo/EmbedConfigurator';

export function EmbedGuide() {
  return (
    <section
      id="embeds"
      aria-labelledby="embed-guide-heading"
      className="scroll-mt-8 border-theme border-t py-16 sm:py-24"
    >
      <p className="font-pixel text-cyan-800 text-xs tracking-label dark:text-secondary">
        EMBED SETUP
      </p>
      <h2
        id="embed-guide-heading"
        className="mt-4 font-pixel text-3xl normal-case tracking-tight sm:text-4xl"
      >
        Put your room on a website.
      </h2>
      <p className="mt-4 max-w-2xl text-theme-muted leading-relaxed">
        Let visitors listen and vote without leaving your site. Choose a player,
        a playlist, or both, then try the controls below.
      </p>
      <EmbedConfigurator />
      <ol className="mt-10 grid gap-6 sm:grid-cols-3">
        <li className="rounded-2xl border border-theme bg-theme-surface p-5">
          <span className="font-pixel text-primary text-xs">01</span>
          <h3 className="mt-3 font-pixel text-lg normal-case tracking-normal">
            Open your room
          </h3>
          <p className="mt-2 text-sm text-theme-muted leading-relaxed">
            On a computer, open room settings and choose “Embed player”.
          </p>
        </li>
        <li className="rounded-2xl border border-theme bg-theme-surface p-5">
          <span className="font-pixel text-primary text-xs">02</span>
          <h3 className="mt-3 font-pixel text-lg normal-case tracking-normal">
            Choose the controls
          </h3>
          <p className="mt-2 text-sm text-theme-muted leading-relaxed">
            Set the layout, voting, skipping and autoplay. Pick a light, dark or
            automatic theme.
          </p>
        </li>
        <li className="rounded-2xl border border-theme bg-theme-surface p-5">
          <span className="font-pixel text-primary text-xs">03</span>
          <h3 className="mt-3 font-pixel text-lg normal-case tracking-normal">
            Paste the code
          </h3>
          <p className="mt-2 text-sm text-theme-muted leading-relaxed">
            Copy it into your site’s HTML or embed block. Visitors follow the
            same room and its permissions.
          </p>
        </li>
      </ol>
    </section>
  );
}
