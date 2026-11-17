import type { BuildOptions, Plugin } from 'vite';

const forbiddenRuntime =
  /\/node_modules\/(?:react|react-dom|react-router|react-router-dom|preact-render-to-string|express)(?:\/|$)/;
const serverModule =
  /(?:\.server\.[cm]?[jt]sx?(?:\?|$)|\/smolter\/dist\/server\/)/;

/** Verify actual emitted browser modules, not dependency declarations. */
export function browserBundle(splitRoutes = true): Plugin {
  let server = false;

  const onLog: NonNullable<
    NonNullable<BuildOptions['rollupOptions']>['onLog']
  > = (level, log, handler) => {
    // React Server Component markers in Motion have no meaning in our Preact
    // renderer. This is the only dependency diagnostic we intentionally omit.
    if (
      log.code === 'MODULE_LEVEL_DIRECTIVE' &&
      log.message.includes('"use client"') &&
      /node_modules\/.*(?:framer-motion|motion-dom|motion-utils)\//.test(
        log.id ?? log.message,
      )
    )
      return;
    // SSR bundles all discovered routes together; shared eager/deferred modules
    // only split in the client graph, where this warning remains an error.
    if (server && log.code === 'INEFFECTIVE_DYNAMIC_IMPORT') return;
    handler(level === 'warn' ? 'error' : level, log);
  };

  return {
    name: 'zoff-browser-bundle',
    apply: 'build',
    config(_config, { isSsrBuild }) {
      server = Boolean(isSsrBuild);
      if (isSsrBuild) {
        return {
          build: {
            rollupOptions: {
              onLog,
              output: {
                assetFileNames: 'assets/[hash][extname]',
              },
            },
          },
        };
      }

      return {
        build: {
          rollupOptions: {
            onLog,
            output: {
              entryFileNames: 'assets/[hash].js',
              chunkFileNames: 'assets/[hash].js',
              assetFileNames: 'assets/[hash][extname]',
              ...(splitRoutes && {
                codeSplitting: {
                  groups: [
                    {
                      name: 'startup',
                      test: /\/node_modules\//,
                      tags: ['$initial'],
                    },
                    {
                      name: 'shell',
                      test: /\/packages\//,
                      tags: ['$initial'],
                    },
                  ],
                },
              }),
            },
          },
        },
      };
    },
    configResolved(config) {
      server = Boolean(config.build.ssr);
    },
    generateBundle(_options, bundle) {
      if (server) return;

      const modules = [
        ...new Set(
          Object.values(bundle).flatMap((output) =>
            output.type === 'chunk' ? Object.keys(output.modules) : [],
          ),
        ),
      ].sort();
      const forbidden = modules.filter(
        (id) => forbiddenRuntime.test(id) || serverModule.test(id),
      );

      if (forbidden.length) {
        this.error(`Unexpected browser modules:\n${forbidden.join('\n')}`);
      }

      this.emitFile({
        type: 'asset',
        fileName: '.vite/browser-modules.json',
        source: JSON.stringify({ modules, forbidden }, null, 2),
      });
    },
  };
}
