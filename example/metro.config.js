const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);

const config = {
  watchFolders: [
    path.resolve(__dirname, '..'),
  ],
  resolver: {
    alias: {
      'justdial-ocr-sdk': path.resolve(__dirname, '../src/index.tsx'),
    },
  },
};

module.exports = mergeConfig(defaultConfig, config);
