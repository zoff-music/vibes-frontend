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
      className="flex max-w-full items-center gap-4"
    >
      {activeProviders.map((provider) => (
        <a
          aria-label={`Open ${providerNames[provider]}`}
          className="hover:bg-theme-surface focus-visible:ring-secondary flex min-h-11 min-w-0 cursor-pointer items-center rounded-lg px-2 opacity-75 transition-colors hover:opacity-100 focus-visible:ring-2 focus-visible:outline-none"
          href={providerURLs[provider]}
          key={provider}
          rel="noreferrer"
          target="_blank"
        >
          <ProviderMark className="h-5 max-w-24 min-w-0" provider={provider} />
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
