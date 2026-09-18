export type Pad = 0 | 1 | 2 | 3;
type Phase = 'idle' | 'showing' | 'playing' | 'cleared' | 'lost' | 'won';

export interface BeatGameState {
  phase: Phase;
  sequence: Pad[];
  round: number;
  playhead: number;
  cue: Pad | null;
  answered: number;
}

export type BeatGameAction =
  | { type: 'start'; sequence: Pad[] }
  | { type: 'tick' }
  | { type: 'ready' }
  | { type: 'press'; pad: Pad }
  | { type: 'next' };

export const TOTAL_ROUNDS = 5;
export const initialBeatGame: BeatGameState = {
  phase: 'idle',
  sequence: [],
  round: 1,
  playhead: 0,
  cue: null,
  answered: 0,
};

export function beatGameReducer(
  state: BeatGameState,
  action: BeatGameAction,
): BeatGameState {
  if (action.type === 'start') {
    return { ...initialBeatGame, phase: 'showing', sequence: action.sequence };
  }

  if (action.type === 'ready' && state.phase === 'showing') {
    return { ...state, phase: 'playing', cue: null };
  }

  if (action.type === 'tick' && state.phase === 'showing') {
    if (state.cue !== null) {
      return { ...state, cue: null, playhead: state.playhead + 1 };
    }

    if (state.playhead === state.round + 1) {
      return { ...state, phase: 'playing' };
    }

    return { ...state, cue: state.sequence[state.playhead] };
  }

  if (action.type === 'press' && state.phase === 'playing') {
    if (action.pad !== state.sequence[state.answered]) {
      return { ...state, phase: 'lost' };
    }

    const answered = state.answered + 1;
    if (answered === state.round + 1) {
      return {
        ...state,
        answered,
        phase: state.round === TOTAL_ROUNDS ? 'won' : 'cleared',
      };
    }

    return { ...state, answered };
  }

  if (action.type === 'next' && state.phase === 'cleared') {
    return {
      ...state,
      phase: 'showing',
      round: state.round + 1,
      playhead: 0,
      answered: 0,
    };
  }

  return state;
}
