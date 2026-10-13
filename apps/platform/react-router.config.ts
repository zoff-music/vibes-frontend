import type { Config } from '@react-router/dev/config';

export default {
  appDirectory: 'src',
  buildDirectory: 'dist',
  publicPath: '/assets/platform/',
  splitRouteModules: 'enforce',
} satisfies Config;
