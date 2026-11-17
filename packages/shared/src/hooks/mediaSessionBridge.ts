// Keep a media element in the application's document so browsers can route
// hardware media actions to its MediaSession instead of a provider iframe.
export function createMediaSessionBridge(userAgent = navigator.userAgent) {
  const isGecko = userAgent.includes('Firefox/');
  const sampleRate = 8000;
  const samples = sampleRate * 8;
  const bytes = new Uint8Array(44 + samples);
  const header = new DataView(bytes.buffer);
  const writeText = (offset: number, text: string) => {
    for (let index = 0; index < text.length; index += 1) {
      bytes[offset + index] = text.charCodeAt(index);
    }
  };
  writeText(0, 'RIFF');
  header.setUint32(4, 36 + samples, true);
  writeText(8, 'WAVEfmt ');
  header.setUint32(16, 16, true);
  header.setUint16(20, 1, true);
  header.setUint16(22, 1, true);
  header.setUint32(24, sampleRate, true);
  header.setUint32(28, sampleRate, true);
  header.setUint16(32, 1, true);
  header.setUint16(34, 8, true);
  writeText(36, 'data');
  header.setUint32(40, samples, true);
  bytes.fill(128, 44);
  if (isGecko) {
    // Gecko's audibility detector rejects exact PCM silence before applying
    // element volume. A tiny signal, attenuated below audible output, lets
    // this document own the session without duplicating provider audio.
    for (let index = 0; index < samples; index += 1) {
      bytes[44 + index] = 128 + Math.round(Math.sin((index * Math.PI) / 4));
    }
  }

  const url = URL.createObjectURL(new Blob([bytes], { type: 'audio/wav' }));
  const audio = new Audio(url);
  audio.loop = true;
  // Gecko ignores volume <= 1e-7 for ownership. At 1e-6, the signal's
  // output peak is below -160 dBFS. Muting would make it ineligible.
  if (isGecko) audio.volume = 0.000001;
  audio.preload = 'auto';

  const reclaim = () => {
    if (audio.paused) return;
    // A newly audible provider iframe can take Gecko's audio focus. Refresh
    // on media updates (also delivered in background tabs), without polling
    // timers, restarting playback, or changing the provider's volume.
    audio.volume = 0;
    audio.volume = 0.000001;
  };
  if (isGecko) {
    audio.addEventListener('playing', reclaim);
    audio.addEventListener('timeupdate', reclaim);
  }

  const dispose = () => {
    if (isGecko) {
      audio.removeEventListener('playing', reclaim);
      audio.removeEventListener('timeupdate', reclaim);
    }
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    URL.revokeObjectURL(url);
  };

  return { audio, dispose };
}
