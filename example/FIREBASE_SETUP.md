# Firebase Setup for Example App

This example app requires Firebase configuration to demonstrate OCR functionality.

## Quick Setup Instructions

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project named "JustdialOCR-Example"
3. **IMPORTANT**: Set region to `asia-south1` (Mumbai) for India compliance

### 2. Enable Required Services
- **Authentication**: Enable Anonymous authentication
- **Vertex AI**: Enable in Google Cloud Console
- **Generative Language API**: Enable in Google Cloud Console

### 3. Add Mobile Apps

#### For Android:
1. Add Android app with package name: `com.justdialocrsdk.example`
2. Download `google-services.json`
3. Replace `example/android/app/google-services.json.example` with your file
4. Rename to `google-services.json`

#### For iOS:
1. Add iOS app with bundle ID: `com.justdialocrsdk.example`  
2. Download `GoogleService-Info.plist`
3. Replace `example/ios/GoogleService-Info.plist.example` with your file
4. Rename to `GoogleService-Info.plist`
5. Add to Xcode project

### 4. Run the Example
```bash
# Install dependencies
yarn install

# iOS
cd ios && pod install && cd ..
yarn ios

# Android  
yarn android
```

## Configuration Files

- `android/app/google-services.json.example` - Template for Android config
- `ios/GoogleService-Info.plist.example` - Template for iOS config

**Replace these with your actual Firebase configuration files!**

## Need Help?

See the complete setup guide: [FIREBASE_SETUP.md](../FIREBASE_SETUP.md)

## Security Note

The example configuration files contain placeholder values. Never commit real Firebase credentials to version control.