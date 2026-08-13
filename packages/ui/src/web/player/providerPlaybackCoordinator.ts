type CoordinatedProvider = 'soundcloud' | 'youtube';

type SilencePlayback = () => void;

const silenceCallbacks = new Map<CoordinatedProvider, Set<SilencePlayback>>();

export function registerProviderPlayback(
  provider: CoordinatedProvider,
  silence: SilencePlayback,
): () => void {
  const providerCallbacks = silenceCallbacks.get(provider) ?? new Set();
  providerCallbacks.add(silence);
  silenceCallbacks.set(provider, providerCallbacks);

  return () => {
    providerCallbacks.delete(silence);
    if (providerCallbacks.size === 0) {
      silenceCallbacks.delete(provider);
    }
  };
}

export function claimProviderPlayback(provider: CoordinatedProvider): void {
  for (const [registeredProvider, callbacks] of silenceCallbacks) {
    if (registeredProvider === provider) continue;
    for (const silence of callbacks) {
      silence();
    }
  }
}

export function silenceProviderPlayback(provider: CoordinatedProvider): void {
  for (const silence of silenceCallbacks.get(provider) ?? []) {
    silence();
  }
}
