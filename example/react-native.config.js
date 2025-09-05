const path = require('path');

module.exports = {
  dependencies: {
    'justdial-ocr-sdk': {
      root: path.join(__dirname, '..'),
    },
    '@react-native-firebase/app': {
      root: path.join(__dirname, '../node_modules/@react-native-firebase/app'),
    },
    '@react-native-firebase/ai': {
      root: path.join(__dirname, '../node_modules/@react-native-firebase/ai'),
    },
  },
};
