import type { Request, Response } from 'express';
import type { Manifest, ManifestChunk } from 'vite';

export function clientEntryPreloads(
  manifest: Manifest,
  entry: ManifestChunk,
  assetBase: string,
) {
  const pending = [entry];
  const visited = new Set<string>();
  const links: string[] = [];
  const base = assetBase.replace(/\/$/, '');

  while (pending.length > 0) {
    const chunk = pending.pop();

    if (!chunk || visited.has(chunk.file)) continue;

    visited.add(chunk.file);
    links.push(`<${base}/${chunk.file}>; rel=modulepreload`);

    // Static imports are required for hydration. Dynamic imports stay lazy.
    for (const key of chunk.imports ?? []) {
      const dependency = manifest[key];

      if (dependency) pending.push(dependency);
    }
  }

  return links;
}

export function sendDocumentPreloads(
  req: Request,
  res: Response,
  links: string[],
) {
  if (req.method !== 'GET' || !req.headers.accept?.includes('text/html')) {
    return;
  }

  if (
    /\/(?:api(?:\/|$)|resources(?:\/|$)|_smolter(?:\/|$)|robots\.txt|llms\.txt|sitemap\.xml|\.well-known\/)/.test(
      req.path,
    )
  ) {
    return;
  }

  const uniqueLinks = [...new Set(links.filter(Boolean))];

  if (uniqueLinks.length === 0) return;

  const existing = res.getHeader('Link');
  const existingLinks = (
    Array.isArray(existing) ? existing.join(', ') : String(existing ?? '')
  )
    .split(/,\s*(?=<)/)
    .filter(Boolean);

  res.set('Link', [...new Set([...uniqueLinks, ...existingLinks])].join(', '));
  res.writeEarlyHints({ link: uniqueLinks });
}

// Only inspect the build-owned static document, never request or SSR markup.
export function staticDocumentPreloads(html: string) {
  const links: string[] = [];
  const head = html.split('</head>')[0] ?? '';

  for (const match of head.matchAll(/<link\b[^>]*>/gi)) {
    const attributes = new Map(
      [
        ...match[0].matchAll(/([\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'))?/g),
      ].map((attribute) => [
        attribute[1]?.toLowerCase(),
        attribute[2] ?? attribute[3] ?? '',
      ]),
    );
    const href = attributes.get('href');
    const rel = attributes.get('rel');
    const as = rel === 'stylesheet' ? 'style' : attributes.get('as');

    if (!href || (rel !== 'stylesheet' && rel !== 'preload')) continue;
    if (as !== 'style' && as !== 'font') continue;

    const cors = attributes.has('crossorigin') ? '; crossorigin' : '';
    const type = as === 'font' ? '; type="font/woff2"' : '';

    links.push(`<${href}>; rel=preload; as=${as}${type}${cors}`);
  }

  return [...new Set(links)];
}
