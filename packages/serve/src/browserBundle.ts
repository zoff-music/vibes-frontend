import type { Plugin } from 'vite';

const forbiddenRuntime =
  /\/node_modules\/(?:react|react-dom|react-router|react-router-dom|preact-render-to-string|express)(?:\/|$)/;
const serverModule =
  /(?:\.server\.[cm]?[jt]sx?(?:\?|$)|\/smolter\/dist\/server\/)/;

/** Verify actual emitted browser modules, not dependency declarations. */
export function browserBundle(): Plugin {
  let server = false;

  return {
    name: 'zoff-browser-bundle',
    apply: 'build',
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
