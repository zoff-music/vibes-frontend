import { beforeEach, vi } from 'vitest';

// A test expecting a warning must explicitly assert it with its own spy.
function installConsoleGuards() {
  for (const method of ['warn', 'error'] as const) {
    vi.spyOn(console, method).mockImplementation((...messages: unknown[]) => {
      throw new Error(
        `Unexpected console.${method}: ${messages.map(String).join(' ')}`,
      );
    });
  }
}

installConsoleGuards();
beforeEach(installConsoleGuards);
