import type { ComponentType, PropsWithChildren, ReactNode } from 'react';
import {
  Component,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import type { NativeRouter } from './router';
import type { DataResult, NavigationState, Params, RouteState } from './types';

const RouterContext = createContext<NativeRouter | null>(null);
const RouteContext = createContext<{ params: Params; routeId: string } | null>(
  null,
);
const FormContext = createContext<
  ((input?: unknown) => Promise<DataResult<unknown>>) | null
>(null);

interface RouterProviderProps extends PropsWithChildren {
  initialMatches?: readonly { params?: Params; routeId: string }[];
  router: NativeRouter;
}

export function RouterProvider({
  children,
  initialMatches = EMPTY_MATCHES,
  router,
}: RouterProviderProps) {
  useEffect(() => {
    for (const match of initialMatches) {
      void router.load(match.routeId, match.params ?? {});
    }
    return () => router.dispose();
  }, [initialMatches, router]);
  return (
    <RouterContext.Provider value={router}>{children}</RouterContext.Provider>
  );
}

interface RouteProps extends PropsWithChildren {
  params?: Params;
  routeId: string;
}

export function Route({ children, params = {}, routeId }: RouteProps) {
  const router = useRouter();
  const stableParams = useStableParams(params);
  const state = useRouteState(routeId, stableParams, true);
  const route = router.getRoute(routeId);
  const retry = useCallback(
    () => void router.retry(routeId, stableParams),
    [routeId, router, stableParams],
  );
  const contextValue = useMemo(
    () => ({ params: stableParams, routeId }),
    [routeId, stableParams],
  );
  let content: ReactNode = children;
  if (children === undefined && route?.default) {
    const RouteComponent = route.default;
    content = <RouteComponent />;
  }
  if (state.unexpectedError && route?.ErrorBoundary) {
    const ErrorBoundary = route.ErrorBoundary;
    content = <ErrorBoundary retry={retry} />;
  }
  if (
    !state.unexpectedError &&
    !state.loaderInitialized &&
    route?.HydrateFallback
  ) {
    const HydrateFallback = route.HydrateFallback;
    content = <HydrateFallback />;
  }
  return (
    <RouteContext.Provider value={contextValue}>
      <RenderErrorBoundary
        onRetry={retry}
        resetKey={`${routeId}:${JSON.stringify(stableParams)}`}
        {...(route?.ErrorBoundary ? { fallback: route.ErrorBoundary } : {})}
      >
        {content}
      </RenderErrorBoundary>
    </RouteContext.Provider>
  );
}

export function useLoaderData<Data>() {
  const route = useCurrentRoute();
  return useRouteLoaderData<Data>(route.routeId, route.params);
}

export function useRouteLoaderData<Data>(routeId: string, params: Params = {}) {
  const state = useRouteState(routeId, useStableParams(params), true);
  return state.loaderData as Data | null;
}

export function useActionData<Data>() {
  const route = useCurrentRoute();
  const state = useRouteState(route.routeId, route.params, false);
  return state.actionData as Data | null;
}

export function useNavigation() {
  const route = useCurrentRoute();
  const state = useRouteState(route.routeId, route.params, false);
  return { state: state.navigationState };
}

export function useRevalidator() {
  const route = useCurrentRoute();
  const router = useRouter();
  const state = useRouteState(route.routeId, route.params, false);
  return useMemo(
    () => ({
      revalidate: () => router.load(route.routeId, route.params, true),
      state: state.navigationState === 'loading' ? 'loading' : 'idle',
    }),
    [route, router, state.navigationState],
  );
}

interface FetcherOptions {
  params?: Params;
  routeId?: string;
}

interface FetcherTarget {
  params?: Params;
  routeId?: string;
}

interface FormProps extends PropsWithChildren {
  action?: string;
  input?: unknown;
  params?: Params;
}

export function Form({ action, children, input, params }: FormProps) {
  const currentRoute = useContext(RouteContext);
  const router = useRouter();
  const routeId = action ?? currentRoute?.routeId ?? '';
  const routeParams = useStableParams(params ?? currentRoute?.params ?? {});
  const submit = useCallback(
    (override?: unknown) =>
      router.submit(
        routeId,
        override === undefined ? input : override,
        routeParams,
      ),
    [input, routeId, routeParams, router],
  );
  if (!routeId) throw new Error('Form requires an action or a parent Route.');
  return <FormContext.Provider value={submit}>{children}</FormContext.Provider>;
}

export function useSubmit() {
  const submit = useContext(FormContext);
  if (!submit) throw new Error('useSubmit must be used inside Form.');
  return submit;
}

export function useFetcher<Data = unknown>(options: FetcherOptions = {}) {
  const currentRoute = useContext(RouteContext);
  const router = useRouter();
  const routeId = options.routeId ?? currentRoute?.routeId ?? '';
  const params = useStableParams(options.params ?? currentRoute?.params ?? {});
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState('');
  const [state, setState] = useState<NavigationState>('idle');
  const operation = useRef(0);
  const controller = useRef<AbortController | null>(null);
  useEffect(
    () => () => {
      controller.current?.abort();
    },
    [],
  );
  const submit = useCallback(
    async (input: unknown, target: FetcherTarget = {}) => {
      const operationId = operation.current + 1;
      operation.current = operationId;
      controller.current?.abort();
      const nextController = new AbortController();
      controller.current = nextController;
      setError('');
      setState('submitting');
      const result = await router.fetchAction<Data>(
        target.routeId ?? routeId,
        input,
        target.params ?? params,
        nextController.signal,
      );
      if (operation.current !== operationId || nextController.signal.aborted) {
        return result;
      }
      controller.current = null;
      setData(result.data);
      setError(result.error);
      setState('idle');
      if (result.unexpected && currentRoute) {
        router.reportUnexpected(currentRoute.routeId, currentRoute.params);
      }
      return result;
    },
    [currentRoute, params, routeId, router],
  );
  const load = useCallback(
    async (target: FetcherTarget = {}) => {
      const operationId = operation.current + 1;
      operation.current = operationId;
      controller.current?.abort();
      const nextController = new AbortController();
      controller.current = nextController;
      setError('');
      setState('loading');
      const result = await router.fetchLoader<Data>(
        target.routeId ?? routeId,
        target.params ?? params,
        nextController.signal,
      );
      if (operation.current !== operationId || nextController.signal.aborted) {
        return result;
      }
      controller.current = null;
      setData(result.data);
      setError(result.error);
      setState('idle');
      if (result.unexpected && currentRoute) {
        router.reportUnexpected(currentRoute.routeId, currentRoute.params);
      }
      return result;
    },
    [currentRoute, params, routeId, router],
  );
  const BoundForm = useCallback(
    ({ children, input }: Pick<FormProps, 'children' | 'input'>) => (
      <Form
        action={routeId}
        params={params}
        {...(input === undefined ? {} : { input })}
      >
        {children}
      </Form>
    ),
    [params, routeId],
  );
  if (!routeId)
    throw new Error('useFetcher requires a routeId or a parent Route.');
  return {
    Form: BoundForm,
    data,
    error,
    load,
    state,
    submit,
  };
}

export function useRouter() {
  const router = useContext(RouterContext);
  if (!router) throw new Error('RouterProvider is missing.');
  return router;
}

function useCurrentRoute() {
  const route = useContext(RouteContext);
  if (!route) throw new Error('This hook requires a parent Route.');
  return route;
}

function useRouteState(routeId: string, params: Params, loadOnMount: boolean) {
  const router = useRouter();
  const subscribe = useCallback(
    (listener: () => void) => router.subscribe(routeId, params, listener),
    [params, routeId, router],
  );
  const getSnapshot = useCallback(
    () => router.getSnapshot(routeId, params),
    [params, routeId, router],
  );
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  useEffect(() => {
    if (loadOnMount) void router.load(routeId, params);
  }, [loadOnMount, params, routeId, router]);
  return state;
}

function useStableParams(params: Params) {
  const key = JSON.stringify(
    Object.entries(params).sort(([left], [right]) => left.localeCompare(right)),
  );
  const ref = useRef({ key, value: params });
  if (ref.current.key !== key) ref.current = { key, value: params };
  return ref.current.value;
}

interface RenderErrorBoundaryProps extends PropsWithChildren {
  fallback?: ComponentType<{ retry: () => void }>;
  onRetry: () => void;
  resetKey: string;
}

class RenderErrorBoundary extends Component<
  RenderErrorBoundaryProps,
  { error: Error | null }
> {
  override state = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  override componentDidUpdate(previousProps: RenderErrorBoundaryProps) {
    if (this.state.error && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  override render() {
    if (this.state.error && this.props.fallback) {
      const ErrorBoundary = this.props.fallback;
      return (
        <ErrorBoundary
          retry={() => {
            this.setState({ error: null });
            this.props.onRetry();
          }}
        />
      );
    }
    if (this.state.error) throw this.state.error;
    return this.props.children;
  }
}

export type { NavigationState, RouteState };

const EMPTY_MATCHES: readonly { params?: Params; routeId: string }[] = [];
