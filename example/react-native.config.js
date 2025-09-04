const path = require('path');

module.exports = {
  dependencies: {
    '@react-native-firebase/app': {
      platforms: {
        android: {
          sourceDir: '../node_modules/@react-native-firebase/app/android',
          packageImportPath: 'io.invertase.firebase.RNFirebasePackage'
        }
      }
    },
    '@react-native-firebase/ai': {
      platforms: {
        android: {
          sourceDir: '../node_modules/@react-native-firebase/ai/android', 
          packageImportPath: 'io.invertase.firebase.ai.ReactNativeFirebaseAIPackage'
        }
      }
    }
  },
};
