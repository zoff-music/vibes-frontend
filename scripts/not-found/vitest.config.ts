import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['scripts/not-found/hydration.test.ts'],
    fileParallelism: false,
    maxWorkers: 1,
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
