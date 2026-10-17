import { useCallback, useEffect, useRef, useState } from 'react';
import type { MutationArgs, RequestArgs, RequestResult } from '../requests';
import { safeWrapAsync } from '../wrap';

type Handler<T> = (args: MutationArgs) => Promise<RequestResult<T>>;
type Params = RequestArgs['params'];
interface Options {
  params?: Params;
  input?: unknown;
}

export function useRequest<T>(handler: Handler<T>, params: Params = {}) {
  const current = useRef({ handler, params });
  const controller = useRef<AbortController | null>(null);
  const [pending, setPending] = useState(false);

  current.current = { handler, params };

  useEffect(() => () => controller.current?.abort(), []);

  const execute = useCallback(async (options: Options = {}) => {
    controller.current?.abort();

    const request = new AbortController();
    controller.current = request;
    setPending(true);

    const [error, result] = await safeWrapAsync(
      current.current.handler({
        params: { ...current.current.params, ...options.params },
        input: options.input,
        signal: request.signal,
      }),
    );

    if (request.signal.aborted) return { data: null, error: '' };

    setPending(false);

    return result ?? { data: null, error: error?.message ?? 'Request failed.' };
  }, []);

  return [pending, execute] as const;
}

export function useMutation<T>(handler: Handler<T>, params?: Params) {
  const [pending, execute] = useRequest(handler, params);
  const mutate = useCallback(
    (input: unknown, options: Omit<Options, 'input'> = {}) =>
      execute({ ...options, input }),
    [execute],
  );

  return [pending, mutate] as const;
}
