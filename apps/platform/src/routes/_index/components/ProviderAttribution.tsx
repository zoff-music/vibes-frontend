import type { Providers } from '@vibes/models';
import type { SourceType } from '@vibes/shared';
import { ProviderMark } from '@vibes/ui';

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
    <div className="mt-5 border-theme border-t pt-4">
      <p className="mb-3 text-center font-pixel text-2xs text-theme-subtle tracking-label">
        MUSIC FROM
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
        {activeProviders.map((provider) => (
          <a
            aria-label={`Open ${providerNames[provider]}`}
            className="flex h-7 cursor-pointer items-center rounded-md px-1 opacity-75 transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-secondary/40"
            href={providerURLs[provider]}
            key={provider}
            rel="noreferrer"
            target="_blank"
          >
            <ProviderMark className="h-5 max-w-24" provider={provider} />
          </a>
        ))}
      </div>
    </div>
  );
}

const orderedProviders: SourceType[] = ['youtube', 'soundcloud', 'spotify'];

const providerNames: Record<SourceType, string> = {
  soundcloud: 'SoundCloud',
  spotify: 'Spotify',
  youtube: 'YouTube',
};

const providerURLs: Record<SourceType, string> = {
  soundcloud: 'https://soundcloud.com',
  spotify: 'https://open.spotify.com',
  youtube: 'https://www.youtube.com',
};
