// Preserve the proxy-appended address chain, not caller-selected identity headers.
// The backend selects its rightmost valid address for rate limiting.
export function getServerRequestHeaders(
  request?: Request,
): Record<string, string> {
  const forwardedFor = request?.headers.get('x-forwarded-for');

  if (!forwardedFor) return {};

  return { 'X-Forwarded-For': forwardedFor };
}
