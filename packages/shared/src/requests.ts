export interface RequestArgs {
  params: Readonly<Record<string, string>>;
  signal: AbortSignal;
}

export interface MutationArgs extends RequestArgs {
  input: unknown;
}

export interface RequestResult<T> {
  data: T | null;
  error: string;
}
