# Firebase Setup for JustdialOCR SDK

Simple Firebase AI Logic setup - NO AUTHENTICATION REQUIRED.

## 📋 Quick Setup (Same as Android OCR repo)

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create project: `your-ocr-project`
3. **IMPORTANT**: Set region to `asia-south1` (Mumbai) for India compliance

### 2. Enable APIs

In [Google Cloud Console](https://console.cloud.google.com/):
- Enable **Vertex AI API**  
- Enable **Generative Language API**

### 3. Add Apps to Firebase Project

#### Android App:
1. Add Android app with package name: `com.yourcompany.yourapp`
2. Download `google-services.json`
3. Place in `android/app/google-services.json`

#### iOS App:
1. Add iOS app with bundle ID: `com.yourcompany.yourapp`
2. Download `GoogleService-Info.plist`
3. Add to iOS project in Xcode

### 4. That's It! 

No user authentication setup needed. The SDK works immediately:

```typescript
import JustdialOCR from 'justdial-ocr-sdk';

// Initialize SDK - uses Firebase project credentials automatically
const ocrSDK = JustdialOCR.getInstance();
await ocrSDK.initialize();

// Complete OCR pipeline in one call
const result = await ocrSDK.captureCheque({
  enableGalleryImport: true,
  scannerMode: 'full'
});
```

## 🔧 Configuration Files

The SDK uses your Firebase project configuration automatically:

- **Android**: `google-services.json`
- **iOS**: `GoogleService-Info.plist`

These files provide:
- Project ID
- API keys (with auto-restrictions)
- Regional settings (asia-south1)
- Vertex AI access credentials

## ✅ Verification

SDK will validate:
- ✅ Firebase project connection
- ✅ Vertex AI API access
- ✅ Region compliance (asia-south1)
- ✅ ML Kit availability

## 🚨 Important Notes

1. **No User Login**: Unlike other Firebase apps, this SDK doesn't require users to sign in
2. **Regional Compliance**: Must use `asia-south1` region for Indian data processing
3. **Firebase AI Logic**: Uses Vertex AI backend, not Gemini Developer API
4. **Auto-Configuration**: All credentials handled by Firebase config files

## 💡 Troubleshooting

**"Firebase not initialized"**
- Check `google-services.json` (Android) or `GoogleService-Info.plist` (iOS) is present

**"Region compliance failed"**
- Ensure Firebase project created with `asia-south1` region

**"Vertex AI API not enabled"**
- Enable Vertex AI API in Google Cloud Console

This matches the exact setup from the [Android OCR repository](https://github.com/manvendrapratapsingh/androidocr) but with Firebase AI Logic instead of Gemini Developer API.