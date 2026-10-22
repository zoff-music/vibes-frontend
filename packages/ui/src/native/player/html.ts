// JSON string escaping does not protect HTML attributes or script boundaries.
export function escapePlayerAttribute(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

export function serializePlayerScript(value: string): string {
  return JSON.stringify(value).replaceAll('<', '\\u003c');
}
