import { ArrowRightIcon } from '@vibes/ui/web';
import { Link } from 'react-router';
import { EmbedConfigurator } from '../../../components/seo/EmbedConfigurator';

export function EmbedPreview() {
  return (
    <section aria-labelledby="embed-heading" className="py-20 sm:py-32">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-pixel text-secondary text-xs tracking-label">
          EMBED YOUR ROOM
        </p>
        <h2
          id="embed-heading"
          className="mt-4 font-pixel text-4xl normal-case leading-tight tracking-tight sm:text-5xl"
        >
          Your room.
          <br />
          On your website.
        </h2>
        <p className="mt-5 text-theme-muted leading-relaxed">
          Choose what visitors see. Try the controls below.
        </p>
      </div>
      <EmbedConfigurator />
      <div className="mt-8 text-center">
        <Link
          to="/discovery/rooms#embeds"
          className="inline-flex min-h-12 items-center gap-3 rounded-xl border border-theme bg-theme-surface px-5 py-3 text-sm text-theme transition-colors hover:border-secondary/60 hover:bg-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
        >
          Embed setup <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
