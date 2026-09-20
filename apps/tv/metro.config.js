const { getDefaultConfig } = require('expo/metro-config');
const { withNativewind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Shared UI and app components must use the same styling runtime.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const isStylingRuntime =
    moduleName === 'react-native-css' ||
    moduleName.startsWith('react-native-css/');
  const origin = isStylingRuntime
    ? { ...context, originModulePath: __filename }
    : context;

  return context.resolveRequest(origin, moduleName, platform);
};

config.resolver.sourceExts = [
  'tv.tsx',
  'tv.ts',
  'ios.tv.tsx',
  'android.tv.tsx',
  ...config.resolver.sourceExts,
];

module.exports = withNativewind(config);
