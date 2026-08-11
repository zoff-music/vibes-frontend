export interface PlaybackPresentation {
  boundedPositionMs: number;
  progress: number;
}

export function getPlaybackPresentation(
  positionMs: number,
  durationMs: number,
): PlaybackPresentation {
  const safeDurationMs = Math.max(durationMs, 0);
  const boundedPositionMs = Math.min(Math.max(positionMs, 0), safeDurationMs);

  return {
    boundedPositionMs,
    progress: safeDurationMs > 0 ? boundedPositionMs / safeDurationMs : 0,
  };
}

export function formatPlaybackMilliseconds(milliseconds: number): string {
  return formatPlaybackSeconds(milliseconds / millisecondsPerSecond);
}

export function formatPlaybackSeconds(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / secondsPerMinute);
  const remainingSeconds = safeSeconds % secondsPerMinute;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function getQueueRemainderLabel(
  totalCount: number,
  visibleCount: number,
): string | null {
  const remainder = Math.max(totalCount - visibleCount, 0);
  if (remainder === 0) return null;
  return `and ${remainder} more`;
}

export function getProviderDisplayName(provider: string): string {
  if (provider === 'youtube') return 'YouTube';
  if (provider === 'soundcloud') return 'SoundCloud';
  if (provider === 'spotify') return 'Spotify';
  return provider;
}

export function chunkItems<Item>(
  items: readonly Item[],
  chunkSize: number,
): Item[][] {
  if (chunkSize <= 0) return [];

  const chunks: Item[][] = [];
  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }
  return chunks;
}

export const playlistGenerationMessages = [
  'Generating your playlist',
  'Finding songs that fit the vibe',
  'Digging through hidden gems',
  'Looking for the perfect opener',
  'Balancing familiar favorites',
  'Adding a few surprises',
  'Checking every track',
  'Keeping the energy flowing',
  'Putting the songs in order',
  'Giving the queue a final polish',
  'Building your music room',
  'Almost ready to press play',
  'Reading between the lines',
  'Matching the mood to the moment',
  'Following the musical thread',
  'Chasing the right kind of energy',
  'Mixing classics with discoveries',
  'Trimming anything that breaks the flow',
  'Looking for official releases',
  'Double-checking the song choices',
  'Shaping the middle of the playlist',
  'Saving the best finish for last',
  'Keeping the playlist coherent',
  'Finding one last hidden gem',
] as const;

export const playlistGenerationMessageIntervalMs = 1_800;

const millisecondsPerSecond = 1_000;

const secondsPerMinute = 60;
