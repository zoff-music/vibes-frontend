import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  type BeatGameState,
  beatGameReducer,
  initialBeatGame,
  type Pad,
  TOTAL_ROUNDS,
} from './beatGameState.ts';

const sequence: Pad[] = [1, 1, 3, 0, 2, 3];

function start() {
  return beatGameReducer(initialBeatGame, { type: 'start', sequence });
}

function finishPattern(state: BeatGameState) {
  let current = state;
  for (const pad of sequence.slice(0, state.round + 1)) {
    current = beatGameReducer(current, { type: 'press', pad });
  }
  return current;
}

test('ignores input before playback completes and separates repeated pads', () => {
  let state = start();
  assert.equal(beatGameReducer(state, { type: 'press', pad: 0 }), state);
  const cues = [];
  while (state.phase === 'showing') {
    state = beatGameReducer(state, { type: 'tick' });
    cues.push(state.cue);
  }
  assert.deepEqual(cues, [1, null, 1, null, null]);
  assert.equal(state.phase, 'playing');
});

test('wrong input ends the round until a new game starts', () => {
  const ready = beatGameReducer(start(), { type: 'ready' });
  const lost = beatGameReducer(ready, { type: 'press', pad: 0 });
  assert.equal(lost.phase, 'lost');
  assert.equal(beatGameReducer(lost, { type: 'press', pad: 1 }), lost);
  assert.deepEqual(beatGameReducer(lost, { type: 'start', sequence }), start());
});

test('each cleared round adds a beat and the fifth completes the game', () => {
  let state = start();
  for (let round = 1; round <= TOTAL_ROUNDS; round += 1) {
    state = beatGameReducer(state, { type: 'ready' });
    state = finishPattern(state);
    assert.equal(state.answered, round + 1);
    if (round < TOTAL_ROUNDS) {
      assert.equal(state.phase, 'cleared');
      state = beatGameReducer(state, { type: 'next' });
      assert.equal(state.round, round + 1);
      assert.equal(state.answered, 0);
    }
  }
  assert.equal(state.phase, 'won');
  assert.equal(beatGameReducer(state, { type: 'next' }), state);
});
