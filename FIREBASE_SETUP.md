# Firebase Project Setup for JustdialOCR React Native SDK

This guide provides step-by-step instructions to set up Firebase for the JustdialOCR React Native SDK.

## 🎯 Prerequisites

- Google Account with Firebase access
- React Native development environment set up
- JustdialOCR SDK project cloned/created

## 🔥 Step 1: Create Firebase Project

### 1.1 Create New Project
```bash
1. Go to https://console.firebase.google.com/
2. Click "Create a project" or "Add project"
3. Enter project name: "JustdialOCR-Production" (or your choice)
4. Optional: Enable Google Analytics
5. Choose Analytics account or create new one
6. Click "Create project"
```

### 1.2 Project Configuration
```bash
# IMPORTANT: Set region to asia-south1 for India compliance
1. Go to Project Settings (gear icon)
2. General tab → Default GCP resource location
3. Select "asia-south1 (Mumbai)" 
4. Click "Done"
```

## 🚀 Step 2: Enable Required APIs

### 2.1 Enable Firebase Services
```bash
# In Firebase Console:
1. Go to "Build" section in left menu
2. Enable these services:

✅ Authentication
   - Go to Authentication → Get started
   - Enable "Anonymous" provider (for testing)
   - Enable "Google" provider (recommended for production)

✅ Functions (optional)
   - For custom processing logic
```

### 2.2 Enable Google Cloud APIs  
```bash
# Go to Google Cloud Console (console.cloud.google.com)
# Select your Firebase project
# Go to "APIs & Services" → "Library"
# Enable these APIs:

✅ Vertex AI API
✅ Generative Language API
✅ Cloud Functions API (if using functions)
✅ Firebase Management API
✅ Firebase Rules API
```

## 📱 Step 3: Configure Mobile Apps

### 3.1 Add Android App
```bash
1. In Firebase Console → Project Overview
2. Click "Add app" → Android icon
3. Fill in details:
   - Package name: com.justdialocrsdk.example (or your package)
   - App nickname: JustdialOCR Android
   - SHA-1: Get from your Android keystore (see below)
4. Click "Register app"
5. Download google-services.json
6. Follow setup instructions
```

**Get SHA-1 fingerprint:**
```bash
# For debug keystore:
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# For release keystore:
keytool -list -v -keystore /path/to/your/keystore.jks -alias your-alias
```

### 3.2 Add iOS App  
```bash
1. In Firebase Console → Project Overview  
2. Click "Add app" → iOS icon
3. Fill in details:
   - Bundle ID: com.justdialocrsdk.example (or your bundle ID)
   - App nickname: JustdialOCR iOS
   - App Store ID: (optional)
4. Click "Register app"
5. Download GoogleService-Info.plist
6. Follow setup instructions
```

## 🔐 Step 4: Authentication Setup

### 4.1 Service Account (Production Recommended)
```bash
1. Go to Google Cloud Console
2. IAM & Admin → Service Accounts
3. Click "Create Service Account"
4. Fill details:
   - Name: justdial-ocr-service
   - Description: Service account for JustdialOCR SDK
5. Grant roles:
   - Vertex AI User
   - Firebase Admin
   - Cloud Functions Invoker
6. Create and download JSON key
7. Store securely (never commit to code!)
```

### 4.2 API Key Setup (Development)
```bash
1. Google Cloud Console → APIs & Services → Credentials
2. Click "Create Credentials" → "API key"
3. Copy the API key
4. Click "Restrict key" and configure:
   - Application restrictions: 
     * Android apps: Add package name + SHA-1
     * iOS apps: Add bundle identifier
   - API restrictions:
     * Vertex AI API
     * Generative Language API
     * Firebase Management API
```

## ⚙️ Step 5: React Native Project Configuration

### 5.1 Android Configuration

**android/app/google-services.json:**
```bash
# Place the downloaded google-services.json in:
android/app/google-services.json
```

**android/build.gradle:**
```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.3.15'
    }
}
```

**android/app/build.gradle:**
```gradle
apply plugin: 'com.google.gms.google-services'

android {
    defaultConfig {
        // Ensure minSdkVersion is at least 21
        minSdkVersion 21
    }
}

dependencies {
    implementation platform('com.google.firebase:firebase-bom:32.7.0')
    implementation 'com.google.firebase:firebase-auth'
    implementation 'com.google.firebase:firebase-vertexai'
}
```

### 5.2 iOS Configuration

**Add GoogleService-Info.plist:**
```bash
1. Open iOS project in Xcode
2. Right-click on project → "Add Files to [ProjectName]"
3. Select downloaded GoogleService-Info.plist
4. Ensure "Add to target" is checked for your app target
```

**ios/Podfile:**
```ruby
platform :ios, '11.0'

target 'YourApp' do
  # ... other pods
  pod 'Firebase/Auth'
  pod 'Firebase/VertexAI'
end

post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '11.0'
    end
  end
end
```

**Run pod install:**
```bash
cd ios && pod install
```

## 🔧 Step 6: SDK Integration

### 6.1 Initialize Firebase in App
```typescript
// App.tsx
import React, { useEffect } from 'react';
import { AppRegistry } from 'react-native';
import firebaseApp from '@react-native-firebase/app';
import JustdialOCR from '@justdial/ocr-sdk';

const App = () => {
  useEffect(() => {
    initializeServices();
  }, []);

  const initializeServices = async () => {
    try {
      // Firebase should auto-initialize from config files
      console.log('Firebase app initialized:', firebaseApp().name);
      
      // Initialize OCR SDK
      const ocrSDK = JustdialOCR.getInstance();
      await ocrSDK.initialize();
      
      console.log('JustdialOCR SDK initialized successfully');
      
      // Verify regional compliance
      const info = ocrSDK.getSDKInfo();
      console.log('Regional compliance:', info.regionalCompliance);
      
    } catch (error) {
      console.error('Initialization failed:', error);
    }
  };

  return (
    // Your app components
  );
};

export default App;
```

### 6.2 Production Authentication Setup
```typescript
// services/FirebaseAuthService.ts
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export class FirebaseAuthService {
  static async initializeAuth() {
    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId: 'your-web-client-id.apps.googleusercontent.com',
    });
  }

  static async signInAnonymously() {
    try {
      await auth().signInAnonymously();
      console.log('Anonymous authentication successful');
    } catch (error) {
      console.error('Anonymous auth failed:', error);
      throw error;
    }
  }

  static async signInWithGoogle() {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(userInfo.idToken);
      await auth().signInWithCredential(googleCredential);
      console.log('Google authentication successful');
    } catch (error) {
      console.error('Google auth failed:', error);
      throw error;
    }
  }

  static getCurrentUser() {
    return auth().currentUser;
  }

  static async signOut() {
    await auth().signOut();
    await GoogleSignin.signOut();
  }
}
```

## 🏗️ Step 7: Environment Configuration

### 7.1 Environment Variables
```bash
# .env (for development)
FIREBASE_API_KEY=AIzaSyDdoFOVvnJOOnGyr3uslRrIitjNi1CwtNI
FIREBASE_PROJECT_ID=justdial-ocr-dev
FIREBASE_AUTH_DOMAIN=justdial-ocr-dev.firebaseapp.com

# .env.production  
FIREBASE_API_KEY=production-api-key
FIREBASE_PROJECT_ID=justdial-ocr-prod
FIREBASE_AUTH_DOMAIN=justdial-ocr-prod.firebaseapp.com
```

### 7.2 Multiple Environment Setup
```typescript
// config/FirebaseConfig.ts
const firebaseConfigs = {
  development: {
    apiKey: "dev-api-key",
    authDomain: "justdial-ocr-dev.firebaseapp.com",
    projectId: "justdial-ocr-dev",
    storageBucket: "justdial-ocr-dev.appspot.com",
    messagingSenderId: "123456789",
    appId: "dev-app-id"
  },
  production: {
    apiKey: "prod-api-key", 
    authDomain: "justdial-ocr-prod.firebaseapp.com",
    projectId: "justdial-ocr-prod",
    storageBucket: "justdial-ocr-prod.appspot.com",
    messagingSenderId: "987654321",
    appId: "prod-app-id"
  }
};

export const getFirebaseConfig = () => {
  const env = __DEV__ ? 'development' : 'production';
  return firebaseConfigs[env];
};
```

## 🛡️ Step 8: Security Configuration

### 8.1 API Key Restrictions
```bash
# In Google Cloud Console → APIs & Services → Credentials
# For each API key, click "Restrict key":

Android Key Restrictions:
✅ Application restrictions: Android apps
✅ Add package name: com.justdialocrsdk.example
✅ Add SHA-1 fingerprint: [your SHA-1]

iOS Key Restrictions:  
✅ Application restrictions: iOS apps
✅ Add bundle identifier: com.justdialocrsdk.example

API Restrictions (for both):
✅ Vertex AI API
✅ Generative Language API
✅ Firebase Management API
```

### 8.2 Firebase Security Rules
```javascript
// Firestore Security Rules (if using Firestore)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}

// Storage Security Rules (if using Storage)
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## ⚡ Step 9: Testing & Verification

### 9.1 Test Firebase Connection
```typescript
// Test Firebase connectivity
const testFirebaseConnection = async () => {
  try {
    const app = firebaseApp();
    console.log('✅ Firebase app name:', app.name);
    console.log('✅ Firebase project ID:', app.options.projectId);
    
    // Test authentication
    await auth().signInAnonymously();
    console.log('✅ Authentication working');
    
    // Test OCR SDK
    const ocrSDK = JustdialOCR.getInstance();
    await ocrSDK.initialize();
    const info = ocrSDK.getSDKInfo();
    console.log('✅ OCR SDK initialized:', info.isInitialized);
    console.log('✅ Regional compliance:', info.regionalCompliance);
    
  } catch (error) {
    console.error('❌ Firebase connection failed:', error);
  }
};
```

### 9.2 Test OCR Processing
```typescript
// Test complete OCR flow
const testOCRFlow = async () => {
  try {
    const ocrSDK = JustdialOCR.getInstance();
    
    // Test document scanner availability
    const info = ocrSDK.getSDKInfo();
    console.log('📷 Document scanner available:', info.mlKit.documentScannerAvailable);
    console.log('🤖 ML Kit available:', info.mlKit.available);
    
    // Test complete capture flow (will prompt for camera)
    const result = await ocrSDK.captureDocument({
      enableGalleryImport: true,
      scannerMode: 'full',
      autoDetectDocumentType: true
    });
    
    console.log('✅ Capture successful:', result.captureResult.scanResult.success);
    console.log('🔍 Document type detected:', result.documentType);
    console.log('📊 Processing time:', result.captureResult.processingTime, 'ms');
    
  } catch (error) {
    console.error('❌ OCR flow failed:', error);
  }
};
```

## 💰 Step 10: Cost Management

### 10.1 Set Up Billing Alerts
```bash
1. Go to Google Cloud Console → Billing
2. Select your billing account
3. Go to "Budgets & alerts"
4. Click "Create budget"
5. Set budget amount (e.g., $50/month)
6. Configure alerts at 50%, 90%, 100%
7. Add email notifications
```

### 10.2 Monitor API Usage
```bash
1. Google Cloud Console → APIs & Services → Dashboard
2. View API usage metrics
3. Set up custom alerts for high usage
4. Monitor Vertex AI API costs specifically
```

## 🐛 Troubleshooting

### Common Issues & Solutions

**1. "Default Firebase app not found"**
```bash
Solution: Ensure config files are correctly placed
- Android: android/app/google-services.json
- iOS: Added to Xcode project properly
```

**2. "Region compliance validation failed"**
```bash
Solution: Verify Firebase project region
- Must be set to asia-south1 (Mumbai)
- Check in Project Settings → Default GCP resource location
```

**3. "Vertex AI API not enabled"**
```bash
Solution: Enable APIs in Google Cloud Console
- Go to APIs & Services → Library
- Search and enable "Vertex AI API"
- Search and enable "Generative Language API"
```

**4. "Authentication failed"**
```bash
Solution: Check authentication setup
- Verify API key restrictions
- Ensure service account has correct roles
- Check if anonymous auth is enabled
```

**5. "ML Kit modules not found"**
```bash
Solution: Check native dependencies
- Android: Verify ML Kit dependencies in build.gradle
- iOS: Run pod install and check Podfile
```

## 📞 Support

If you encounter issues:
1. Check this troubleshooting section
2. Verify all setup steps were completed
3. Check Firebase Console for error logs  
4. Review Google Cloud Console API usage
5. Create GitHub issue with detailed error logs

---

## 📋 Setup Checklist

Use this checklist to ensure complete setup:

### Firebase Project Setup
- [ ] Created Firebase project with asia-south1 region
- [ ] Enabled Authentication (Anonymous + Google)
- [ ] Enabled Vertex AI API in Google Cloud Console
- [ ] Enabled Generative Language API

### Mobile App Configuration  
- [ ] Added Android app to Firebase project
- [ ] Downloaded and placed google-services.json
- [ ] Added iOS app to Firebase project  
- [ ] Downloaded and added GoogleService-Info.plist to Xcode

### Authentication Setup
- [ ] Created service account (production)
- [ ] Downloaded service account key JSON
- [ ] Created and restricted API keys
- [ ] Configured authentication in app

### Security Configuration
- [ ] Set up API key restrictions
- [ ] Configured Firebase security rules
- [ ] Set up billing alerts
- [ ] Tested authentication flow

### Testing & Verification
- [ ] Tested Firebase connection
- [ ] Verified OCR SDK initialization
- [ ] Confirmed regional compliance
- [ ] Tested complete OCR flow
- [ ] Monitored API usage and costs

**Setup Complete!** 🎉 Your Firebase project is ready for JustdialOCR SDK.