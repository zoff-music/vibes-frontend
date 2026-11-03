import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['scripts/players/live.test.ts'],
    fileParallelism: false,
    maxWorkers: 1,
    testTimeout: 1_800_000,
    hookTimeout: 30_000,
  },
});
