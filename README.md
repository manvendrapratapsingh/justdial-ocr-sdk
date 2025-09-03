# @justdial/ocr-sdk

React Native SDK for Indian cheque and e-NACH OCR with fraud detection capabilities.

## 🚀 Features

- **Firebase AI Integration**: Uses Vertex AI with asia-south1 region for India compliance
- **Optimized for Performance**: 30-70% latency improvement over standard implementations
- **Fraud Detection**: Advanced fraud detection for cheques with multiple validation layers
- **Cross-platform**: Works on both iOS and Android
- **Regional Compliance**: Enforces asia-south1 region for data residency compliance
- **Image Optimization**: Automatic image preprocessing for optimal OCR results
- **TypeScript Support**: Full TypeScript definitions included

## 📦 Installation

```bash
npm install @justdial/ocr-sdk
# or
yarn add @justdial/ocr-sdk
```

### iOS Setup

1. Add to your `Podfile`:
```ruby
pod 'Firebase/VertexAI-Preview'
```

2. Run pod install:
```bash
cd ios && pod install
```

3. Add Firebase configuration file (`GoogleService-Info.plist`) to your iOS project.

### Android Setup

1. Add Firebase configuration file (`google-services.json`) to `android/app/`.

2. Add to your `android/app/build.gradle`:
```gradle
apply plugin: 'com.google.gms.google-services'
```

3. Add to your `android/build.gradle`:
```gradle
classpath 'com.google.gms:google-services:4.3.15'
```

## 🎯 Quick Start

```typescript
import JustdialOCR from '@justdial/ocr-sdk';

// Initialize the SDK
const ocrSDK = JustdialOCR.getInstance();
await ocrSDK.initialize();

// Process a cheque
const result = await ocrSDK.processCheque('file://path/to/cheque.jpg');

if (result.success && result.data) {
  console.log('Bank Name:', result.data.bankName);
  console.log('Account Number:', result.data.accountNumber);
  console.log('Amount:', result.data.amountInNumbers);
  
  // Check for fraud indicators
  if (result.data.fraudIndicators.length > 0) {
    console.log('⚠️ Fraud indicators:', result.data.fraudIndicators);
  }
}
```

## 📖 API Reference

### JustdialOCR Class

#### `getInstance(): JustdialOCR`
Get singleton instance of the SDK.

#### `async initialize(): Promise<void>`
Initialize the SDK with Firebase configuration. Must be called before using OCR methods.

#### `isServiceInitialized(): boolean`
Check if SDK is properly initialized.

#### `validateRegionalCompliance(): boolean`
Validate that SDK is using asia-south1 region for compliance. Returns `true` only if compliant.

#### `async processCheque(imageUri: string, options?: OCRProcessingOptions): Promise<ChequeOCRResult>`
Process Indian bank cheque for OCR with fraud detection.

**Parameters:**
- `imageUri`: Path or URI to the cheque image
- `options`: Optional processing configuration

**Returns:** `ChequeOCRResult` with extracted data and fraud indicators

#### `async processENach(imageUri: string, options?: OCRProcessingOptions): Promise<ENachOCRResult>`
Process Indian e-NACH mandate form for OCR.

**Parameters:**
- `imageUri`: Path or URI to the e-NACH form image
- `options`: Optional processing configuration

**Returns:** `ENachOCRResult` with extracted mandate data

#### `getSDKInfo(): SDKInfo`
Get SDK version, status, and capability information.

### Data Types

#### `ChequeOCRData`
```typescript
interface ChequeOCRData {
  bankName: string;
  branchAddress: string;
  ifscCode: string;
  accountHolderName: string;
  accountNumber: string;
  chequeNumber: string;
  micrCode: string;
  date: string;
  amountInWords: string;
  amountInNumbers: string;
  payToName: string;
  signaturePresent: boolean;
  documentQuality: string;
  documentType: string;
  authorizationPresent: boolean;
  fraudIndicators: string[];
  confidence: number;
  processingTime: number;
}
```

#### `ENachOCRData`
```typescript
interface ENachOCRData {
  utilityName: string;
  utilityCode: string;
  customerRefNumber: string;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountType: string;
  maxAmount: string;
  frequency: string;
  startDate: string;
  endDate: string;
  primaryAccountRef: string;
  sponsorBankName: string;
  umrn: string;
  mandateType: string;
  authMode: string;
  customerSignature: boolean;
  dateOfMandate: string;
  confidence: number;
  processingTime: number;
}
```

#### `OCRProcessingOptions`
```typescript
interface OCRProcessingOptions {
  enablePreprocessing?: boolean;  // Default: true
  enableValidation?: boolean;     // Default: true
  enableFraudDetection?: boolean; // Default: true
  timeout?: number;               // Default: 30000ms
}
```

## 🔒 Security Features

### Fraud Detection for Cheques

The SDK includes advanced fraud detection that checks for:

- Missing or invalid signatures
- Poor document quality
- High-amount transactions (>₹1,00,000)
- Multiple missing critical fields
- Inconsistent data patterns

### Regional Compliance

- **Enforced asia-south1 region**: All processing happens in India region
- **Data residency compliance**: No data leaves Indian boundaries
- **Validation checks**: SDK validates regional compliance on initialization

## 🏗️ Architecture

### Based on Android Implementation

This React Native SDK is a direct port of the optimized Android implementation:

- **Reference Repository**: [androidocr](https://github.com/manvendrapratapsingh/androidocr)
- **Key Optimizations Ported**:
  - Temperature=0.1 for consistent results
  - maxOutputTokens=4096 for complete responses
  - Image optimization (1024px max dimension)
  - Optimized prompt engineering
  - JSON response parsing with error handling

### Performance Optimizations

- **Image Preprocessing**: Automatic image optimization before processing
- **Prompt Engineering**: Concise, optimized prompts for faster processing
- **Native Image Handling**: iOS and Android native modules for efficient image processing
- **Memory Management**: Proper cleanup of image resources

## 📱 Example App

The SDK includes a comprehensive example app demonstrating:

- SDK initialization
- Image selection and preprocessing
- Cheque OCR with fraud detection display
- e-NACH OCR processing
- Error handling and user feedback

Run the example:

```bash
# Install dependencies
yarn

# Run on iOS
yarn example ios

# Run on Android
yarn example android
```

## 🧪 Testing

```bash
# Run unit tests
yarn test

# Run type checking
yarn typecheck

# Run linting
yarn lint

# Build the library
yarn prepare
```

## 📄 License

MIT License. See [LICENSE](./LICENSE) for details.

## 🤝 Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/manvendrapratapsingh/OCR-ReactNative-SDK/issues)
- **Documentation**: This README and inline code documentation
- **Email**: tech@justdial.com

## 🔄 Changelog

### v1.0.0
- Initial release
- Firebase AI integration with asia-south1 compliance
- Cheque OCR with fraud detection
- e-NACH OCR processing
- Cross-platform support (iOS + Android)
- Image optimization and preprocessing
- Comprehensive example app

---

**Built with ❤️ for Indian fintech applications**

*Ensuring secure, compliant, and accurate OCR processing for Indian banking documents.*

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
