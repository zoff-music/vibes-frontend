import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Manifest } from 'vite';

const output = new URL('../dist/', import.meta.url);

export const prerender = {
  directory: fileURLToPath(new URL('server/prerender/', output)),
  paths: [
    '/faq',
    '/discovery/apps',
    '/discovery/cinema',
    '/discovery/listening',
    '/discovery/queue',
    '/discovery/rooms',
    '/discovery/videos',
    '/discovery/watching',
  ],
};

// Render through the same entry and root loader used by a production request.
if (import.meta.main) {
  const build: {
    clientAssetBase: string;
    default(request: Request, entry: string): Promise<Response>;
  } = await import(new URL('server/index.js', output).href);
  const manifest: Manifest = JSON.parse(
    await readFile(new URL('client/.vite/manifest.json', output), 'utf8'),
  );
  const entry = manifest['index.html'];
  if (!entry?.isEntry) throw new Error('Platform client entry is missing');
  const clientEntry = `${build.clientAssetBase.replace(/\/$/, '')}/${entry.file}`;

  for (const route of prerender.paths) {
    const directory = path.join(prerender.directory, route.slice(1));
    await mkdir(directory, { recursive: true });
    for (const theme of ['auto', 'dark', 'light'] as const) {
      const preferences = Buffer.from(
        JSON.stringify({ version: 1, theme }),
      ).toString('base64url');
      const request = new Request(new URL(route, 'https://zoff.me'), {
        headers: { Accept: 'text/html', Cookie: `preferences=${preferences}` },
      });
      const response = await build.default(request, clientEntry);
      if (
        response.status !== 200 ||
        !response.headers.get('content-type')?.includes('text/html')
      ) {
        throw new Error(
          `Prerender failed for ${route} (${theme}): HTTP ${response.status}`,
        );
      }
      await writeFile(
        path.join(directory, `${theme}.html`),
        await response.text(),
      );
    }
  }
  // The SSR bundle starts long-lived services. All build output is flushed above.
  process.exit(0);
}
