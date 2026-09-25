import { promisify } from 'node:util';
import { brotliCompress, constants, gzip } from 'node:zlib';
import type { Plugin } from 'vite';

const compressBrotli = promisify(brotliCompress);
const compressGzip = promisify(gzip);

export function precompressAssets(): Plugin {
  return {
    name: 'vibes-precompress-assets',
    apply: 'build',
    enforce: 'post',
    applyToEnvironment: (environment) => environment.name === 'client',
    config() {
      return {
        build: {
          minify: 'terser',
          terserOptions: {
            compress: { passes: 3 },
            format: { comments: false },
          },
        },
      };
    },
    configEnvironment(name) {
      if (name === 'client') return;

      return { build: { minify: false } };
    },
    generateBundle: {
      order: 'post',
      async handler(_options, bundle) {
        // Sequential files bound peak memory during multi-app Docker builds.
        for (const asset of Object.values(bundle)) {
          if (!/\.(?:js|mjs|css|svg|json)$/.test(asset.fileName)) continue;

          const source = asset.type === 'chunk' ? asset.code : asset.source;
          const bytes = Buffer.from(source);
          if (bytes.length < 1024) continue;

          const brotli = await compressBrotli(bytes, {
            params: {
              [constants.BROTLI_PARAM_QUALITY]: 11,
              [constants.BROTLI_PARAM_MODE]: constants.BROTLI_MODE_TEXT,
              [constants.BROTLI_PARAM_SIZE_HINT]: bytes.length,
            },
          });
          const gzipped = await compressGzip(bytes, { level: 9 });

          for (const [extension, compressed] of [
            ['br', brotli],
            ['gz', gzipped],
          ] as const) {
            if (compressed.length >= bytes.length) continue;

            this.emitFile({
              type: 'asset',
              fileName: `${asset.fileName}.${extension}`,
              source: compressed,
            });
          }
        }
      },
    },
  };
}
