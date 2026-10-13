import type { ApiResult } from '../client';

interface CachedValue<T> {
  value: T;
  expires: number;
}

interface PendingRequest<T> {
  controller: AbortController;
  result: ApiResult<T>;
  consumers: number;
}

// Only public, explicitly short-lived reads belong in this cache.
export function createPublicRequestCache<T>(lifetime: number) {
  const values = new Map<string, CachedValue<T>>();
  const pending = new Map<string, PendingRequest<T>>();

  return async (
    key: string,
    load: (signal: AbortSignal) => ApiResult<T>,
    signal?: AbortSignal,
    consume = false,
  ): ApiResult<T> => {
    if (signal?.aborted) {
      return [new DOMException('Request aborted', 'AbortError'), null];
    }

    const cached = values.get(key);
    if (cached && cached.expires > Date.now()) {
      if (consume) values.delete(key);

      return [null, cached.value];
    }

    values.delete(key);
    let request = pending.get(key);
    if (!request || request.controller.signal.aborted) {
      const controller = new AbortController();
      const result = load(controller.signal);
      request = { controller, result, consumers: 0 };
      pending.set(key, request);
    }

    const active = request;
    active.consumers += 1;

    return new Promise((resolve) => {
      let settled = false;
      const finish = (result: Awaited<ApiResult<T>>) => {
        if (settled) return;

        settled = true;
        signal?.removeEventListener('abort', abort);
        active.consumers -= 1;
        if (active.consumers === 0) {
          active.controller.abort();
          if (pending.get(key) === active) pending.delete(key);
        }

        resolve(result);
      };
      const abort = () =>
        finish([new DOMException('Request aborted', 'AbortError'), null]);

      signal?.addEventListener('abort', abort, { once: true });
      void active.result.then((result) => {
        if (settled) return;

        if (!result[0] && !consume) {
          for (const [cachedKey, entry] of values) {
            if (entry.expires <= Date.now() || values.size >= 16) {
              values.delete(cachedKey);
            }
          }

          values.set(key, { value: result[1], expires: Date.now() + lifetime });
        }

        if (consume) values.delete(key);
        finish(result);
      });
    });
  };
}
