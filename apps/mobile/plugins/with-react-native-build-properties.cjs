const { withPodfileProperties } = require('expo/config-plugins');

const withReactNativeBuildProperties = (config) =>
  withPodfileProperties(config, (podfileConfig) => {
    podfileConfig.modResults['ios.buildReactNativeFromSource'] = 'true';
    return podfileConfig;
  });

module.exports = withReactNativeBuildProperties;
