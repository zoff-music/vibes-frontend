/** Keep separate development servers reachable through their normal site links. */
export function localAppURL(url: URL) {
  if (!['localhost', '127.0.0.1'].includes(url.hostname)) return url;

  if (!['3001', '3005', '3006', '3007'].includes(url.port)) return url;

  const target = new URL(url);
  const apps: [string, string][] = [
    ['/admin', '3005'],
    ['/remotes', '3007'],
    ['/embed', '3006'],
    ['/casting/receiver', '3003'],
  ];
  target.port =
    apps.find(
      ([prefix]) =>
        target.pathname === prefix || target.pathname.startsWith(`${prefix}/`),
    )?.[1] ?? '3001';

  if (target.pathname === '/casting/receiver') target.pathname += '/';

  return target;
}

const localPorts = new Set(['3001', '3003', '3005', '3006', '3007']);

export function isLocalAppHandoff(from: URL, to: URL) {
  return (
    ['localhost', '127.0.0.1'].includes(from.hostname) &&
    from.hostname === to.hostname &&
    from.protocol === to.protocol &&
    localPorts.has(from.port) &&
    localPorts.has(to.port) &&
    from.origin !== to.origin
  );
}

export function leaveDocument(destination: URL) {
  if (
    !isLocalAppHandoff(new URL(location.href), destination) ||
    matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    location.assign(destination.href);

    return;
  }

  document.cookie = 'zoff-page-entry=1; Path=/; Max-Age=10; SameSite=Lax';
  // Keep the outgoing document fully painted until the destination is ready.
  location.assign(destination.href);
}

// Runs while the SSR document is parsed, before hydration or the first paint.
export const entryScript = `if(document.cookie.split('; ').includes('zoff-page-entry=1')){document.cookie='zoff-page-entry=; Path=/; Max-Age=0; SameSite=Lax';document.documentElement.dataset.pageEnter='';setTimeout(()=>delete document.documentElement.dataset.pageEnter,250)}`;

export const applicationEnvironment = {
  resolveURL: localAppURL,
  isDocumentHandoff: isLocalAppHandoff,
  leaveDocument,
  entryScript,
};
