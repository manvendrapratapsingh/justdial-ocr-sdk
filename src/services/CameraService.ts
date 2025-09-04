import { NativeModules, Platform } from 'react-native';
import type { 
  DocumentScanResult, 
  MLKitTextRecognitionResult, 
  CameraOptions, 
  ScannerMode 
} from '../types/CameraTypes';

const { JustdialOcrSdk } = NativeModules;

export class CameraService {
  private static readonly TAG = 'CameraService';

  /**
   * Open native document scanner with camera and optional gallery import
   */
  static async openDocumentScanner(options: CameraOptions = {}): Promise<DocumentScanResult> {
    try {
      console.log(`${CameraService.TAG}: Opening document scanner`);
      
      const {
        enableGalleryImport = true,
        scannerMode = 'full'
      } = options;

      if (!JustdialOcrSdk) {
        throw new Error('Native module not available');
      }

      const result = await JustdialOcrSdk.openDocumentScanner(
        enableGalleryImport,
        scannerMode
      );

      console.log(`${CameraService.TAG}: Document scanner completed successfully`);
      return result;
    } catch (error) {
      console.error(`${CameraService.TAG}: Document scanner failed`, error);
      throw error;
    }
  }

  /**
   * Open image picker for gallery selection (iOS only, Android uses document scanner)
   */
  static async openImagePicker(): Promise<DocumentScanResult> {
    try {
      console.log(`${CameraService.TAG}: Opening image picker`);
      
      if (!JustdialOcrSdk) {
        throw new Error('Native module not available');
      }

      if (Platform.OS === 'ios') {
        const result = await JustdialOcrSdk.openImagePicker();
        console.log(`${CameraService.TAG}: Image picker completed successfully`);
        return result;
      } else {
        // On Android, use document scanner with gallery enabled
        return await CameraService.openDocumentScanner({ 
          enableGalleryImport: true, 
          scannerMode: 'base' 
        });
      }
    } catch (error) {
      console.error(`${CameraService.TAG}: Image picker failed`, error);
      throw error;
    }
  }

  /**
   * Recognize text from image using ML Kit
   */
  static async recognizeTextFromImage(imageUri: string): Promise<MLKitTextRecognitionResult> {
    try {
      console.log(`${CameraService.TAG}: Starting ML Kit text recognition`);
      
      if (!JustdialOcrSdk) {
        throw new Error('Native module not available');
      }

      const result = await JustdialOcrSdk.recognizeTextFromImage(imageUri);
      
      console.log(`${CameraService.TAG}: ML Kit text recognition completed`);
      console.log(`${CameraService.TAG}: Detected ${result.textBlocks?.length || 0} text blocks`);
      
      return result;
    } catch (error) {
      console.error(`${CameraService.TAG}: ML Kit text recognition failed`, error);
      throw error;
    }
  }

  /**
   * Install required ML Kit modules (Android only)
   */
  static async installMLKitModules(): Promise<string> {
    try {
      console.log(`${CameraService.TAG}: Installing ML Kit modules`);
      
      if (!JustdialOcrSdk) {
        throw new Error('Native module not available');
      }

      const result = await JustdialOcrSdk.installMLKitModules();
      console.log(`${CameraService.TAG}: ML Kit modules installation completed`);
      return result;
    } catch (error) {
      console.error(`${CameraService.TAG}: ML Kit modules installation failed`, error);
      throw error;
    }
  }

  /**
   * Check if document scanner is available on the current platform
   */
  static isDocumentScannerAvailable(): boolean {
    if (Platform.OS === 'ios') {
      return Platform.Version >= '13.0';
    } else if (Platform.OS === 'android') {
      return Platform.Version >= 21; // Android 5.0+
    }
    return false;
  }

  /**
   * Check if ML Kit text recognition is available
   */
  static isMLKitTextRecognitionAvailable(): boolean {
    return Platform.OS === 'ios' || Platform.OS === 'android';
  }

  /**
   * Get available scanner modes for the current platform
   */
  static getAvailableScannerModes(): ScannerMode[] {
    if (Platform.OS === 'android') {
      return ['base', 'base_with_filter', 'full'];
    } else {
      // iOS VNDocumentCameraViewController doesn't have configurable modes
      return ['full'];
    }
  }

  /**
   * Process scanned document through the complete OCR pipeline
   */
  static async processScanResult(
    scanResult: DocumentScanResult,
    documentType: 'cheque' | 'enach' = 'cheque'
  ): Promise<MLKitTextRecognitionResult & { documentType: string }> {
    try {
      if (!scanResult.success || !scanResult.pages || scanResult.pages.length === 0) {
        throw new Error('Invalid scan result');
      }

      const firstPage = scanResult.pages?.[0];
      if (!firstPage) {
        throw new Error('No pages captured in scan result');
      }
      const mlKitResult = await CameraService.recognizeTextFromImage(firstPage.imageUri);

      return {
        ...mlKitResult,
        documentType,
      };
    } catch (error) {
      console.error(`${CameraService.TAG}: Failed to process scan result`, error);
      throw error;
    }
  }

  /**
   * Enhanced document capture with automatic document type detection
   */
  static async captureDocument(options: CameraOptions & { 
    autoDetectDocumentType?: boolean 
  } = {}): Promise<{
    scanResult: DocumentScanResult;
    mlKitResult: MLKitTextRecognitionResult;
    detectedDocumentType?: 'cheque' | 'enach' | 'unknown';
  }> {
    try {
      console.log(`${CameraService.TAG}: Starting enhanced document capture`);

      // Step 1: Capture document
      const scanResult = await CameraService.openDocumentScanner(options);
      
      if (!scanResult.success || !scanResult.pages || scanResult.pages.length === 0) {
        throw new Error('Document capture failed');
      }

      // Step 2: Process with ML Kit
      const firstPage = scanResult.pages[0];
      if (!firstPage) {
        throw new Error('No pages found in scan result');
      }
      const mlKitResult = await CameraService.recognizeTextFromImage(
        firstPage.imageUri
      );

      // Step 3: Auto-detect document type (optional)
      let detectedDocumentType: 'cheque' | 'enach' | 'unknown' | undefined;
      
      if (options.autoDetectDocumentType) {
        detectedDocumentType = CameraService.detectDocumentType(mlKitResult.fullText);
      }

      console.log(`${CameraService.TAG}: Enhanced document capture completed`);
      if (detectedDocumentType) {
        console.log(`${CameraService.TAG}: Detected document type: ${detectedDocumentType}`);
      }

      return {
        scanResult,
        mlKitResult,
        detectedDocumentType,
      };
    } catch (error) {
      console.error(`${CameraService.TAG}: Enhanced document capture failed`, error);
      throw error;
    }
  }

  /**
   * Simple document type detection based on text content
   */
  private static detectDocumentType(text: string): 'cheque' | 'enach' | 'unknown' {
    const lowerText = text.toLowerCase();
    
    // Cheque indicators
    const chequeKeywords = [
      'pay to',
      'pay to the order of',
      'rupees',
      'account no',
      'ifsc',
      'micr',
      'cheque',
      'bank'
    ];

    // e-NACH indicators  
    const enachKeywords = [
      'mandate',
      'nach',
      'autopay',
      'standing instruction',
      'utility',
      'umrn',
      'sponsor bank',
      'debit type'
    ];

    const chequeMatches = chequeKeywords.filter(keyword => 
      lowerText.includes(keyword)
    ).length;

    const enachMatches = enachKeywords.filter(keyword => 
      lowerText.includes(keyword)
    ).length;

    if (chequeMatches >= 3) {
      return 'cheque';
    } else if (enachMatches >= 2) {
      return 'enach';
    } else {
      return 'unknown';
    }
  }
}