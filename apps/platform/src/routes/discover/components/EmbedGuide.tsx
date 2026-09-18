import { EmbedConfigurator } from '../../../components/seo/EmbedConfigurator';

export function EmbedGuide() {
  return (
    <section
      id="embeds"
      aria-labelledby="embed-guide-heading"
      className="my-12 scroll-mt-8 py-12 sm:my-20 sm:py-16"
    >
      <p className="font-pixel text-secondary text-xs tracking-label">
        EMBED SETUP
      </p>
      <h2
        id="embed-guide-heading"
        className="mt-4 font-pixel text-3xl normal-case tracking-tight sm:text-4xl"
      >
        Put your room on a website.
      </h2>
      <p className="mt-4 max-w-2xl text-theme-muted leading-relaxed">
        Choose a player, a playlist, or both. Try the controls below.
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
