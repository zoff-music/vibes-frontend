import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { brotliCompressSync, gzipSync } from 'node:zlib';

const root = resolve(import.meta.dirname, '..');
const apps = {
  platform: 'dist/client',
  admin: 'dist/client',
  embed: 'dist/client',
  remote: 'dist/client',
  cast: 'dist',
  tv: 'dist/tizen',
};
const report = {};

for (const [app, output] of Object.entries(apps)) {
  const directory = resolve(root, 'apps', app, output);
  const files = await readdir(directory, { recursive: true });
  const sizes = new Map();

  for (const file of files.filter((name) => name.endsWith('.js'))) {
    const source = await readFile(resolve(directory, file));
    sizes.set(file, {
      gzip: gzipSync(source, { level: 9 }).length,
      brotli: brotliCompressSync(source).length,
    });
  }

  function total(names) {
    const result = { gzip: 0, brotli: 0 };

    for (const name of new Set(names)) {
      const size = sizes.get(name);
      if (!size) throw new Error(`Missing JavaScript asset: ${app}/${name}`);

      result.gzip += size.gzip;
      result.brotli += size.brotli;
    }

    return result;
  }

  const entries = {};
  const manifestPath = '.vite/manifest.json';

  if (files.includes(manifestPath)) {
    const manifest = JSON.parse(
      await readFile(resolve(directory, manifestPath), 'utf8'),
    );

    function closure(key, visited = new Set()) {
      if (visited.has(key)) return [];
      visited.add(key);
      const chunk = manifest[key];
      if (!chunk) throw new Error(`Missing manifest entry: ${app}/${key}`);

      return [
        ...(chunk.file.endsWith('.js') ? [chunk.file] : []),
        ...(chunk.imports ?? []).flatMap((id) => closure(id, visited)),
      ];
    }

    for (const [key, chunk] of Object.entries(manifest)) {
      if (!chunk.isEntry && !chunk.isDynamicEntry) continue;

      entries[key] = total(closure(key));
    }
  }

  report[app] = { allJavaScript: total(sizes.keys()), entries };
}

// Entry closures exclude later dynamic imports and count shared chunks once.
// allJavaScript is an inventory, not the initial page transfer size.
console.log(JSON.stringify(report, null, 2));
