import type { ComponentType } from 'react';

export type Params = Readonly<Record<string, string>>;

export interface LoaderFunctionArgs {
  params: Params;
  signal: AbortSignal;
}

export interface ActionFunctionArgs<Input = unknown> {
  input: Input;
  params: Params;
  signal: AbortSignal;
}

export interface DataResult<Data> {
  data: Data | null;
  error: string;
  unexpected?: true;
}

export interface RouteModule {
  default?: ComponentType;
  ErrorBoundary?: ComponentType<{ retry: () => void }>;
  HydrateFallback?: ComponentType;
  action?: (args: ActionFunctionArgs) => Promise<DataResult<unknown>>;
  loader?: (args: LoaderFunctionArgs) => Promise<DataResult<unknown>>;
  shouldRevalidate?: (args: ShouldRevalidateFunctionArgs) => boolean;
}

export interface ShouldRevalidateFunctionArgs {
  actionResult: DataResult<unknown>;
  defaultShouldRevalidate: boolean;
  params: Params;
}

export type NavigationState = 'idle' | 'loading' | 'submitting';

export interface RouteState {
  actionData: unknown;
  actionError: string;
  actionState: 'idle' | 'submitting';
  loaderData: unknown;
  loaderError: string;
  loaderInitialized: boolean;
  loaderState: 'idle' | 'loading';
  navigationState: NavigationState;
  unexpectedError: boolean;
}
