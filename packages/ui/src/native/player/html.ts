import escapeHtml from 'escape-html';

// JSON string escaping does not protect HTML attributes or script boundaries.
export function escapePlayerAttribute(value: string): string {
  return escapeHtml(value);
}

export function serializePlayerScript(value: string): string {
  return JSON.stringify(value).replaceAll('<', '\\u003c');
}
