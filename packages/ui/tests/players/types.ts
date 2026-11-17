import type { SourceType } from '@vibes/models';

export type Provider = SourceType;

export interface Track {
  provider: Provider;
  id: string;
}

export interface Snapshot {
  id: string;
  position: number;
  paused: boolean;
  muted: boolean;
  volume: number;
  seeks: number;
}

export interface PlayerState {
  id: string;
  position: number;
  playing: boolean;
  muted: boolean;
  volume: number;
  loading: boolean;
  ended: boolean;
  reference: number;
  seeks: number;
}

export interface PlayerTest {
  sample: (provider: Provider) => Snapshot;
  faults: { blocked: boolean; loadingPauseCalls: number; seeks: number };
  finish: () => void;
  ends: () => number;
  index: () => number;
  changed: () => boolean;
}

declare global {
  const __LIVE_PLAYERS__: boolean;
  interface Window {
    playerTest: PlayerTest;
    overlayFlashed: boolean;
    overlayFrames: (string | null)[];
    observedMedia: Set<HTMLMediaElement>;
    providerCommands: string[];
    observedAudioOutputs: Set<AnalyserNode>;
  }
}
