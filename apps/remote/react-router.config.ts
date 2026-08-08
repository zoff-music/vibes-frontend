import type { Config } from '@react-router/dev/config';

export default {
  appDirectory: 'src',
  buildDirectory: 'dist',
  publicPath: '/remotes/',
  routeDiscovery: {
    mode: 'lazy',
    manifestPath: '/remotes/__manifest',
  },
} satisfies Config;
