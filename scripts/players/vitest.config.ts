import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      'scripts/players/native-bridge.test.ts',
      'scripts/players/integration.test.ts',
    ],
    fileParallelism: false,
    maxWorkers: 1,
    testTimeout: 240_000,
    hookTimeout: 30_000,
  },
});
