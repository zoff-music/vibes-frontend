/**
 * Safely executes a synchronous function and returns an error-first tuple.
 */
export function safeWrap<T>(fn: () => T): [Error | null, T | null] {
  try {
    return [null, fn()];
  } catch (err) {
    return [err instanceof Error ? err : new Error(String(err)), null];
  }
}

/**
 * Safely resolves a promise and returns an error-first tuple.
 */
export async function safeWrapAsync<T>(
  promise: Promise<T>,
): Promise<[Error | null, T | null]> {
  try {
    return [null, await promise];
  } catch (err) {
    return [err instanceof Error ? err : new Error(String(err)), null];
  }
}
