// Keep a media element in the application's document so browsers can route
// hardware media actions to its MediaSession instead of a provider iframe.
export function createMediaSessionBridge() {
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

  const url = URL.createObjectURL(new Blob([bytes], { type: 'audio/wav' }));
  const audio = new Audio(url);
  audio.loop = true;
  // Muting the element would make it ineligible for media-key ownership.
  // The PCM samples themselves are silence; no provider audio is duplicated.
  audio.preload = 'auto';

  const dispose = () => {
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    URL.revokeObjectURL(url);
  };

  return { audio, dispose };
}
