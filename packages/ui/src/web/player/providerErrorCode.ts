export function providerErrorCode(event: unknown, fallback: string): string {
  if (typeof event === 'number' && Number.isFinite(event)) return String(event);
  if (typeof event === 'string' && event.length > 0 && event.length <= 128)
    return event;
  if (event && typeof event === 'object') {
    if ('code' in event) return providerErrorCode(event.code, fallback);
    if (
      'data' in event &&
      (typeof event.data === 'number' || typeof event.data === 'string')
    )
      return providerErrorCode(event.data, fallback);
  }
  return fallback;
}
