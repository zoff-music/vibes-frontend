import type { Providers } from '@vibes/models';
import type { SourceType } from '@vibes/shared';
import { ProviderMark } from '@vibes/ui/web';

interface ProviderAttributionProps {
  providers: Providers;
}

export function ProviderAttribution({ providers }: ProviderAttributionProps) {
  const activeProviders = orderedProviders.filter((provider) =>
    providers.includes(provider),
  );
  if (activeProviders.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Music providers"
      className="flex flex-wrap items-center gap-x-4 gap-y-2"
    >
      {activeProviders.map((provider) => (
        <a
          aria-label={`Open ${providerNames[provider]}`}
          className="flex min-h-11 cursor-pointer items-center rounded-lg px-2 opacity-75 transition-colors hover:bg-theme-surface hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          href={providerURLs[provider]}
          key={provider}
          rel="noreferrer"
          target="_blank"
        >
          <ProviderMark className="h-5 max-w-24" provider={provider} />
        </a>
      ))}
    </nav>
  );
}

const orderedProviders: SourceType[] = ['youtube', 'soundcloud'];

const providerNames: Record<SourceType, string> = {
  soundcloud: 'SoundCloud',
  youtube: 'YouTube',
};

const providerURLs: Record<SourceType, string> = {
  soundcloud: 'https://soundcloud.com',
  youtube: 'https://www.youtube.com',
};
