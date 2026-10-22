import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  type BeatGameState,
  beatGameReducer,
  initialBeatGame,
  type Pad,
} from './beatGameState.ts';

const sequence: Pad[] = [1, 1];

function start() {
  return beatGameReducer(initialBeatGame, { type: 'start', sequence });
}

function finishPattern(state: BeatGameState) {
  let current = state;

  for (const pad of state.sequence) {
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

test('rounds keep extending the same pattern beyond the former five-round limit', () => {
  let state = start();
  for (let round = 1; round <= 100; round += 1) {
    state = beatGameReducer(state, { type: 'ready' });
    state = finishPattern(state);
    assert.equal(state.phase, 'cleared');
    assert.equal(state.answered, round + 1);
    const previous = state.sequence;
    state = beatGameReducer(state, { type: 'next', pad: 3 });
    assert.equal(state.round, round + 1);
    assert.equal(state.answered, 0);
    assert.equal(state.phase, 'showing');
    assert.deepEqual(state.sequence, [...previous, 3]);
  }
});

test('next-round events cannot advance a lost or unfinished round', () => {
  const showing = start();
  assert.equal(beatGameReducer(showing, { type: 'next', pad: 2 }), showing);
  const lost = beatGameReducer(beatGameReducer(showing, { type: 'ready' }), {
    type: 'press',
    pad: 0,
  });
  assert.equal(beatGameReducer(lost, { type: 'next', pad: 2 }), lost);
});
