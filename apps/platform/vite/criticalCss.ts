import { compileSheet, encodePlan } from 'beasties/compiler';
import type { Plugin } from 'vite';

export function criticalCss(): Plugin {
  let base = '/';

  return {
    name: 'platform-critical-css',
    apply: 'build',
    configResolved(config) {
      base = config.base;
    },
    generateBundle(_options, bundle) {
      const sheets = Object.values(bundle).filter(
        (asset) => asset.type === 'asset' && asset.fileName.endsWith('.css'),
      );
      if (sheets.length === 0) return;

      const plans = sheets.map((asset) =>
        encodePlan(
          compileSheet(String(asset.source), {
            href: `${base}${asset.fileName}`,
            exact: false,
          }),
        ),
      );

      this.emitFile({
        type: 'asset',
        fileName: '.vite/critical-css.json',
        source: JSON.stringify(plans),
      });
    },
  };
}
