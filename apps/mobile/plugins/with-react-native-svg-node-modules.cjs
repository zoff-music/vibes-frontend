const { withPodfile } = require('expo/config-plugins');

const reactNativeSvgNodeModules =
  "ENV['REACT_NATIVE_NODE_MODULES_DIR'] ||= File.expand_path('../node_modules', __dir__)";

const withReactNativeSvgNodeModules = (config) =>
  withPodfile(config, (podfileConfig) => {
    if (podfileConfig.modResults.contents.includes(reactNativeSvgNodeModules)) {
      return podfileConfig;
    }

    podfileConfig.modResults.contents = `${reactNativeSvgNodeModules}\n${podfileConfig.modResults.contents}`;
    return podfileConfig;
  });

module.exports = withReactNativeSvgNodeModules;
