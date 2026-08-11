const { getDefaultConfig } = require('expo/metro-config');
const { withNativewind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts = [
  'tv.tsx',
  'tv.ts',
  'ios.tv.tsx',
  'android.tv.tsx',
  ...config.resolver.sourceExts,
];

module.exports = withNativewind(config);
