import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('boot.js', import.meta.url), 'utf8');
function bootFixture(failLaunch = false) {
  const state = {
    ready: false,
    launches: 0,
    scripts: [],
    pending: [],
    message: {},
  };
  const context = {
    document: {
      currentScript: { getAttribute: () => './assets/app.js' },
      getElementById: () => state.message,
      createElement: () => ({}),
      head: { appendChild: (script) => state.scripts.push(script) },
    },
    tizen: {
      ApplicationControl: function ApplicationControl() {},
      application: {
        launchAppControl: (_control, id, _success, failure) => {
          assert.equal(id, 'ZoffMusic0.PlayerService');
          state.launches += 1;
          if (failLaunch) failure({ message: 'Service launch denied' });
        },
      },
    },
    setTimeout: (callback) => state.pending.push(callback),
    XMLHttpRequest: function XMLHttpRequest() {
      this.open = (_method, url) =>
        assert.equal(url, 'http://127.0.0.1:34771/health');
      this.send = () => {
        if (!state.ready) return this.onerror();
        this.status = 200;
        this.responseText = 'Zoff player ready';
        this.onload();
      };
    },
  };
  vm.runInNewContext(source, context);
  return state;
}

test('waits for service readiness before loading the classic application', () => {
  const state = bootFixture();
  assert.equal(state.launches, 1);
  assert.equal(state.scripts.length, 0);
  state.ready = true;
  state.pending.shift()();
  assert.equal(state.scripts.length, 1);
  assert.equal(state.scripts[0].src, './assets/app.js');
  assert.equal(state.launches, 1);
});

test('service launch failure stays visible and never starts the app', () => {
  const state = bootFixture(true);
  state.ready = true;
  for (const callback of state.pending) callback();
  assert.match(state.message.textContent, /Service launch denied/);
  assert.equal(state.scripts.length, 0);
});

test('a service that never becomes ready produces a bounded startup error', () => {
  const state = bootFixture();
  while (state.pending.length) state.pending.shift()();
  assert.match(state.message.textContent, /Restart Zoff/);
  assert.equal(state.launches, 1);
  assert.equal(state.scripts.length, 0);
});
