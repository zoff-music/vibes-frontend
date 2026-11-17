import { afterAll, vi } from 'vitest';
import './setup.browser';

// DOM storage must be provided by browser fixtures, never Node's experimental
// localStorage getter (which warns without a configured storage file).
vi.stubGlobal('localStorage', undefined);
const failWarning = (warning: Error) => {
  throw warning;
};
process.on('warning', failWarning);
afterAll(() => {
  process.off('warning', failWarning);
});
