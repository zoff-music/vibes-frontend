import type { Config } from '@react-router/dev/config';

export default {
  appDirectory: 'src',
  buildDirectory: 'dist',
  publicPath: '/admin/',
  routeDiscovery: {
    mode: 'lazy',
    manifestPath: '/admin/__manifest',
  },
} satisfies Config;
