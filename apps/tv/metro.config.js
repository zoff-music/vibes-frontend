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

const nativewindConfig = withNativewind(config);
const resolveNativewind = nativewindConfig.resolver.resolveRequest;

nativewindConfig.resolver.resolveRequest = (context, moduleName, platform) => {
  // Expo needs React Native's complete native-view and asset registry exports.
  if (
    moduleName === 'react-native' &&
    /\/node_modules\/(?:expo|expo-[^/]+|@expo\/[^/]+)\//.test(
      context.originModulePath,
    )
  ) {
    return context.resolveRequest(context, moduleName, platform);
  }

  return resolveNativewind(context, moduleName, platform);
};

module.exports = nativewindConfig;
