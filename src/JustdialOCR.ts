import { getApp } from '@react-native-firebase/app';
import { DocumentProcessorService } from './services/DocumentProcessorService';
import { MLKitDocumentService } from './services/MLKitDocumentService';
import { CameraService } from './services/CameraService';
import type { 
  ChequeOCRResult, 
  ENachOCRResult, 
  OCRProcessingOptions,
  CameraOptions,
  DocumentCaptureResult,
  MLKitTextRecognitionResult
} from './types';

export default class JustdialOCR {
  private static instance: JustdialOCR | null = null;
  private static readonly TAG = 'JustdialOCR';
  
  private documentProcessor: DocumentProcessorService;
  private mlKitDocumentService: MLKitDocumentService;
  private isInitialized = false;
  private readonly version = '1.0.0';

  private constructor() {
    this.documentProcessor = new DocumentProcessorService();
    this.mlKitDocumentService = new MLKitDocumentService();
  }

  /**
   * Get singleton instance of JustdialOCR
   */
  static getInstance(): JustdialOCR {
    if (!JustdialOCR.instance) {
      JustdialOCR.instance = new JustdialOCR();
    }
    return JustdialOCR.instance;
  }

  /**
   * Initialize the SDK with Firebase AI Logic
   * NO AUTHENTICATION REQUIRED - uses project credentials from config files
   * Must be called before using any OCR methods
   */
  async initialize(): Promise<void> {
    try {
      console.log(`${JustdialOCR.TAG}: Initializing JustdialOCR SDK v${this.version}`);
      console.log(`${JustdialOCR.TAG}: Using Firebase AI Logic (No user authentication required)`);
      console.log(`${JustdialOCR.TAG}: Initializing for India region compliance (asia-south1)`);

      // Initialize Firebase automatically from config files
      // google-services.json (Android) / GoogleService-Info.plist (iOS)  
      const app = getApp();
      
      await this.documentProcessor.initialize(app);
      await this.mlKitDocumentService.initialize(app);
      
      // Validate regional compliance
      if (!this.validateRegionalCompliance()) {
        throw new Error('Regional compliance validation failed. SDK must use asia-south1 region.');
      }

      this.isInitialized = true;
      console.log(`${JustdialOCR.TAG}: ✅ JustdialOCR SDK initialized successfully`);
      console.log(`${JustdialOCR.TAG}: Regional compliance: PASSED (asia-south1)`);
    } catch (error) {
      console.error(`${JustdialOCR.TAG}: SDK initialization failed`, error);
      throw error;
    }
  }

  /**
   * Check if SDK is initialized
   */
  isServiceInitialized(): boolean {
    return this.isInitialized && 
           this.documentProcessor.isInitialized() && 
           this.mlKitDocumentService.isServiceInitialized();
  }

  /**
   * Validate that SDK is configured for India region compliance
   * Returns true only if using asia-south1 region
   */
  validateRegionalCompliance(): boolean {
    const isCompliant = this.documentProcessor.validateRegionalCompliance();
    console.log(`${JustdialOCR.TAG}: Regional compliance check: ${isCompliant ? 'PASSED' : 'FAILED'}`);
    return isCompliant;
  }

  /**
   * Process Indian bank cheque for OCR with fraud detection
   * @param imageUri - URI or path to the cheque image
   * @param options - Processing options
   * @returns Promise resolving to cheque OCR result with fraud indicators
   */
  async processCheque(
    imageUri: string, 
    options?: OCRProcessingOptions
  ): Promise<ChequeOCRResult> {
    this.ensureInitialized();

    try {
      console.log(`${JustdialOCR.TAG}: Starting cheque OCR processing`);
      console.log(`${JustdialOCR.TAG}: Fraud detection: ${options?.enableFraudDetection !== false ? 'ENABLED' : 'DISABLED'}`);
      
      const result = await this.documentProcessor.processCheque(imageUri, undefined, {
        enablePreprocessing: true,
        enableValidation: true,
        enableFraudDetection: true,
        timeout: 30000, // 30 second timeout
        ...options,
      });

      console.log(`${JustdialOCR.TAG}: Cheque processing completed`);
      console.log(`${JustdialOCR.TAG}: Success: ${result.success}`);
      
      if (result.data?.fraudIndicators && result.data.fraudIndicators.length > 0) {
        console.log(`${JustdialOCR.TAG}: ⚠️ Fraud indicators detected: ${result.data.fraudIndicators.length}`);
      }

      return result;
    } catch (error) {
      console.error(`${JustdialOCR.TAG}: Cheque processing failed`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Process Indian e-NACH mandate form for OCR
   * @param imageUri - URI or path to the e-NACH form image  
   * @param options - Processing options
   * @returns Promise resolving to e-NACH OCR result
   */
  async processENach(
    imageUri: string,
    options?: OCRProcessingOptions
  ): Promise<ENachOCRResult> {
    this.ensureInitialized();

    try {
      console.log(`${JustdialOCR.TAG}: Starting e-NACH OCR processing`);
      
      const result = await this.documentProcessor.processENach(imageUri, undefined, {
        enablePreprocessing: true,
        enableValidation: true,
        timeout: 30000, // 30 second timeout
        ...options,
      });

      console.log(`${JustdialOCR.TAG}: e-NACH processing completed`);
      console.log(`${JustdialOCR.TAG}: Success: ${result.success}`);

      return result;
    } catch (error) {
      console.error(`${JustdialOCR.TAG}: e-NACH processing failed`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Capture cheque using camera/gallery and process with OCR
   */
  async captureCheque(
    cameraOptions: CameraOptions = {},
    processingOptions?: OCRProcessingOptions
  ): Promise<{
    captureResult: DocumentCaptureResult;
    ocrResult: ChequeOCRResult;
  }> {
    this.ensureInitialized();
    return await this.mlKitDocumentService.captureCheque(cameraOptions, processingOptions);
  }

  /**
   * Capture e-NACH using camera/gallery and process with OCR
   */
  async captureENach(
    cameraOptions: CameraOptions = {},
    processingOptions?: OCRProcessingOptions
  ): Promise<{
    captureResult: DocumentCaptureResult;
    ocrResult: ENachOCRResult;
  }> {
    this.ensureInitialized();
    return await this.mlKitDocumentService.captureENach(cameraOptions, processingOptions);
  }

  /**
   * Capture any document with auto-detection and process accordingly
   */
  async captureDocument(
    cameraOptions: CameraOptions = {},
    processingOptions?: OCRProcessingOptions
  ): Promise<{
    captureResult: DocumentCaptureResult;
    ocrResult: ChequeOCRResult | ENachOCRResult;
    documentType: 'cheque' | 'enach' | 'unknown';
  }> {
    this.ensureInitialized();
    return await this.mlKitDocumentService.captureDocument(cameraOptions, processingOptions);
  }

  /**
   * Open document scanner (camera + optional gallery)
   */
  async openDocumentScanner(cameraOptions: CameraOptions = {}) {
    this.ensureInitialized();
    return await CameraService.openDocumentScanner(cameraOptions);
  }

  /**
   * Open image picker for gallery selection
   */
  async openImagePicker() {
    this.ensureInitialized();
    return await CameraService.openImagePicker();
  }

  /**
   * Process existing image with ML Kit text recognition
   */
  async recognizeTextFromImage(imageUri: string): Promise<MLKitTextRecognitionResult> {
    this.ensureInitialized();
    return await CameraService.recognizeTextFromImage(imageUri);
  }

  /**
   * Process existing image with complete OCR pipeline
   */
  async processExistingImage(
    imageUri: string,
    documentType: 'cheque' | 'enach' | 'auto' = 'auto',
    processingOptions?: OCRProcessingOptions
  ) {
    this.ensureInitialized();
    return await this.mlKitDocumentService.processExistingImage(
      imageUri, 
      documentType, 
      processingOptions
    );
  }

  /**
   * Get SDK version and configuration info
   */
  getSDKInfo(): {
    version: string;
    isInitialized: boolean;
    regionalCompliance: boolean;
    supportedDocuments: string[];
    features: string[];
    mlKit: {
      available: boolean;
      documentScannerAvailable: boolean;
      supportedScannerModes: string[];
    };
  } {
    const mlKitInfo = this.mlKitDocumentService.getServiceInfo();
    
    return {
      version: this.version,
      isInitialized: this.isServiceInitialized(),
      regionalCompliance: this.validateRegionalCompliance(),
      supportedDocuments: ['Indian Bank Cheques', 'e-NACH Mandate Forms'],
      features: [
        'Complete OCR Pipeline in Single SDK Call',
        'NO User Authentication Required',
        'Firebase AI Logic (Vertex AI backend)',
        'ML Kit Camera & Gallery Integration',
        'OCR Text Extraction',
        'Fraud Detection',
        'Field Validation', 
        'Image Optimization',
        'Cross-platform Support (iOS + Android)',
        'Asia-South1 Regional Compliance',
        'Auto Document Type Detection',
        'Self-Contained Architecture'
      ],
      mlKit: {
        available: mlKitInfo.mlKitAvailable,
        documentScannerAvailable: mlKitInfo.documentScannerAvailable,
        supportedScannerModes: mlKitInfo.supportedScannerModes,
      },
    };
  }

  /**
   * Reset SDK state (mainly for testing)
   */
  reset(): void {
    console.log(`${JustdialOCR.TAG}: Resetting SDK state`);
    this.isInitialized = false;
    JustdialOCR.instance = null;
  }

  private ensureInitialized(): void {
    if (!this.isServiceInitialized()) {
      throw new Error('JustdialOCR SDK not initialized. Call initialize() first.');
    }
  }

}