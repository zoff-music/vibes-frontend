import {
  type ApplicationOptions,
  deploymentPlugin,
  applicationPlugins as smolterPlugins,
} from '@kasperrt/smolter/preact/vite';
import { localAppURL } from '@vibes/shared/navigation';
import type { Plugin } from 'vite';
import { browserBundle } from './browserBundle.ts';

interface WebApplicationOptions extends ApplicationOptions {
  deployment?: boolean;
}

export function applicationPlugins({
  deployment = true,
  ...options
}: WebApplicationOptions = {}): Plugin[] {
  return [
    browserBundle(options.splitRoutes !== false),
    ...(deployment ? [deploymentPlugin()] : []),
    {
      name: 'zoff-development',
      config() {
        process.env.VITE_API_URL_INTERNAL ??= 'https://zoff.me';

        return {
          ssr: {
            noExternal: [
              /^@vibes\//,
              'framer-motion',
              'motion-dom',
              'motion-utils',
              'zustand',
              'qrcode.react',
              'react-youtube',
            ],
          },
        };
      },
      configureServer(server) {
        server.middlewares.use((incoming, outgoing, next) => {
          if (!incoming.headers.accept?.includes('text/html')) return next();

          const current = new URL(
            incoming.url ?? '/',
            `http://${incoming.headers.host}`,
          );
          const target = localAppURL(current);

          if (target.origin === current.origin) return next();

          outgoing.writeHead(302, { Location: target.href });
          outgoing.end();
        });
      },
    },
    ...smolterPlugins({
      resourceRequest: (url) =>
        /\/(?:resources\/tv\/|robots\.txt|llms\.txt|sitemap\.xml|\.well-known\/security\.txt|tv-player)/.test(
          url,
        ),
      ...options,
    }),
  ];
}
