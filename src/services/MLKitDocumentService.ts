import { CameraService } from './CameraService';
import { DocumentProcessorService } from './DocumentProcessorService';
// Using any type temporarily for Firebase app
import type { 
  CameraOptions, 
  DocumentCaptureResult,
  MLKitTextRecognitionResult,
  ChequeOCRResult,
  ENachOCRResult,
  OCRProcessingOptions 
} from '../types';

export class MLKitDocumentService {
  private static readonly TAG = 'MLKitDocumentService';
  private documentProcessor: DocumentProcessorService;
  private isInitialized = false;

  constructor() {
    this.documentProcessor = new DocumentProcessorService();
  }

  async initialize(app: any): Promise<void> {
    try {
      console.log(`${MLKitDocumentService.TAG}: Initializing ML Kit Document Service`);
      
      await this.documentProcessor.initialize(app);
      
      // Install ML Kit modules if needed (Android)
      try {
        await CameraService.installMLKitModules();
      } catch (error) {
        console.log(`${MLKitDocumentService.TAG}: ML Kit modules already installed or not needed`);
      }

      this.isInitialized = true;
      console.log(`${MLKitDocumentService.TAG}: ✅ ML Kit Document Service initialized`);
    } catch (error) {
      console.error(`${MLKitDocumentService.TAG}: Initialization failed`, error);
      throw error;
    }
  }

  isServiceInitialized(): boolean {
    return this.isInitialized && this.documentProcessor.isInitialized();
  }

  /**
   * Complete cheque capture and processing flow
   */
  async captureCheque(
    cameraOptions: CameraOptions = {},
    processingOptions?: OCRProcessingOptions
  ): Promise<{
    captureResult: DocumentCaptureResult;
    ocrResult: ChequeOCRResult;
  }> {
    try {
      console.log(`${MLKitDocumentService.TAG}: Starting complete cheque capture flow`);
      
      if (!this.isServiceInitialized()) {
        throw new Error('Service not initialized');
      }

      const startTime = Date.now();

      // Step 1: Capture document with camera/gallery
      const scanResult = await CameraService.captureDocument({
        ...cameraOptions,
        autoDetectDocumentType: true,
      });

      // Validate that we captured a cheque
      if (scanResult.detectedDocumentType && scanResult.detectedDocumentType !== 'cheque') {
        console.warn(`${MLKitDocumentService.TAG}: Detected ${scanResult.detectedDocumentType}, expected cheque`);
      }

      // Step 2: Process with Firebase AI OCR
      const imageUri = scanResult.scanResult.pages?.[0]?.imageUri;
      if (!imageUri) {
        throw new Error('No image captured');
      }

      const ocrResult = await this.documentProcessor.processCheque(
        imageUri,
        undefined,
        processingOptions
      );

      const totalTime = Date.now() - startTime;

      const captureResult: DocumentCaptureResult = {
        ...scanResult,
        processingTime: totalTime,
      };

      console.log(`${MLKitDocumentService.TAG}: Cheque capture completed in ${totalTime}ms`);
      
      return { captureResult, ocrResult };
    } catch (error) {
      console.error(`${MLKitDocumentService.TAG}: Cheque capture failed`, error);
      throw error;
    }
  }

  /**
   * Complete e-NACH capture and processing flow
   */
  async captureENach(
    cameraOptions: CameraOptions = {},
    processingOptions?: OCRProcessingOptions
  ): Promise<{
    captureResult: DocumentCaptureResult;
    ocrResult: ENachOCRResult;
  }> {
    try {
      console.log(`${MLKitDocumentService.TAG}: Starting complete e-NACH capture flow`);
      
      if (!this.isServiceInitialized()) {
        throw new Error('Service not initialized');
      }

      const startTime = Date.now();

      // Step 1: Capture document with camera/gallery
      const scanResult = await CameraService.captureDocument({
        ...cameraOptions,
        autoDetectDocumentType: true,
      });

      // Validate that we captured e-NACH
      if (scanResult.detectedDocumentType && scanResult.detectedDocumentType !== 'enach') {
        console.warn(`${MLKitDocumentService.TAG}: Detected ${scanResult.detectedDocumentType}, expected e-NACH`);
      }

      // Step 2: Process with Firebase AI OCR
      const imageUri = scanResult.scanResult.pages?.[0]?.imageUri;
      if (!imageUri) {
        throw new Error('No image captured');
      }

      const ocrResult = await this.documentProcessor.processENach(
        imageUri,
        undefined,
        processingOptions
      );

      const totalTime = Date.now() - startTime;

      const captureResult: DocumentCaptureResult = {
        ...scanResult,
        processingTime: totalTime,
      };

      console.log(`${MLKitDocumentService.TAG}: e-NACH capture completed in ${totalTime}ms`);
      
      return { captureResult, ocrResult };
    } catch (error) {
      console.error(`${MLKitDocumentService.TAG}: e-NACH capture failed`, error);
      throw error;
    }
  }

  /**
   * Capture any document and auto-detect type, then process accordingly
   */
  async captureDocument(
    cameraOptions: CameraOptions = {},
    processingOptions?: OCRProcessingOptions
  ): Promise<{
    captureResult: DocumentCaptureResult;
    ocrResult: ChequeOCRResult | ENachOCRResult;
    documentType: 'cheque' | 'enach' | 'unknown';
  }> {
    try {
      console.log(`${MLKitDocumentService.TAG}: Starting auto-detect document capture`);
      
      if (!this.isServiceInitialized()) {
        throw new Error('Service not initialized');
      }

      const startTime = Date.now();

      // Step 1: Capture and detect document type
      const scanResult = await CameraService.captureDocument({
        ...cameraOptions,
        autoDetectDocumentType: true,
      });

      const imageUri = scanResult.scanResult.pages?.[0]?.imageUri;
      if (!imageUri) {
        throw new Error('No image captured');
      }

      const detectedType = scanResult.detectedDocumentType || 'unknown';
      console.log(`${MLKitDocumentService.TAG}: Detected document type: ${detectedType}`);

      // Step 2: Process based on detected type
      let ocrResult: ChequeOCRResult | ENachOCRResult;

      if (detectedType === 'cheque') {
        ocrResult = await this.documentProcessor.processCheque(
          imageUri,
          undefined,
          processingOptions
        );
      } else if (detectedType === 'enach') {
        ocrResult = await this.documentProcessor.processENach(
          imageUri,
          undefined,
          processingOptions
        );
      } else {
        // Default to cheque processing for unknown documents
        console.warn(`${MLKitDocumentService.TAG}: Unknown document type, defaulting to cheque processing`);
        ocrResult = await this.documentProcessor.processCheque(
          imageUri,
          undefined,
          processingOptions
        );
      }

      const totalTime = Date.now() - startTime;

      const captureResult: DocumentCaptureResult = {
        ...scanResult,
        processingTime: totalTime,
      };

      console.log(`${MLKitDocumentService.TAG}: Auto-detect capture completed in ${totalTime}ms`);
      
      return { captureResult, ocrResult, documentType: detectedType };
    } catch (error) {
      console.error(`${MLKitDocumentService.TAG}: Auto-detect capture failed`, error);
      throw error;
    }
  }

  /**
   * Process existing image without camera capture
   */
  async processExistingImage(
    imageUri: string,
    documentType: 'cheque' | 'enach' | 'auto' = 'auto',
    processingOptions?: OCRProcessingOptions
  ): Promise<{
    mlKitResult: MLKitTextRecognitionResult;
    ocrResult: ChequeOCRResult | ENachOCRResult;
    detectedDocumentType: 'cheque' | 'enach' | 'unknown';
  }> {
    try {
      console.log(`${MLKitDocumentService.TAG}: Processing existing image`);
      
      if (!this.isServiceInitialized()) {
        throw new Error('Service not initialized');
      }

      // Step 1: ML Kit text recognition
      const mlKitResult = await CameraService.recognizeTextFromImage(imageUri);

      // Step 2: Document type detection
      let detectedDocumentType: 'cheque' | 'enach' | 'unknown';
      
      if (documentType === 'auto') {
        // Auto-detect based on ML Kit text
        const lowerText = mlKitResult.fullText.toLowerCase();
        
        const chequeKeywords = ['pay to', 'rupees', 'account no', 'ifsc', 'cheque'];
        const enachKeywords = ['mandate', 'nach', 'utility', 'umrn'];
        
        const chequeMatches = chequeKeywords.filter(k => lowerText.includes(k)).length;
        const enachMatches = enachKeywords.filter(k => lowerText.includes(k)).length;
        
        if (chequeMatches >= 2) {
          detectedDocumentType = 'cheque';
        } else if (enachMatches >= 1) {
          detectedDocumentType = 'enach';
        } else {
          detectedDocumentType = 'unknown';
        }
      } else {
        detectedDocumentType = documentType;
      }

      console.log(`${MLKitDocumentService.TAG}: Detected/selected document type: ${detectedDocumentType}`);

      // Step 3: Process with appropriate OCR
      let ocrResult: ChequeOCRResult | ENachOCRResult;

      if (detectedDocumentType === 'cheque') {
        ocrResult = await this.documentProcessor.processCheque(
          imageUri,
          undefined,
          processingOptions
        );
      } else if (detectedDocumentType === 'enach') {
        ocrResult = await this.documentProcessor.processENach(
          imageUri,
          undefined,
          processingOptions
        );
      } else {
        // Default to cheque for unknown
        ocrResult = await this.documentProcessor.processCheque(
          imageUri,
          undefined,
          processingOptions
        );
      }

      console.log(`${MLKitDocumentService.TAG}: Existing image processing completed`);
      
      return { mlKitResult, ocrResult, detectedDocumentType };
    } catch (error) {
      console.error(`${MLKitDocumentService.TAG}: Existing image processing failed`, error);
      throw error;
    }
  }

  /**
   * Get service capabilities and status
   */
  getServiceInfo(): {
    isInitialized: boolean;
    mlKitAvailable: boolean;
    documentScannerAvailable: boolean;
    supportedScannerModes: string[];
    supportedDocumentTypes: string[];
  } {
    return {
      isInitialized: this.isServiceInitialized(),
      mlKitAvailable: CameraService.isMLKitTextRecognitionAvailable(),
      documentScannerAvailable: CameraService.isDocumentScannerAvailable(),
      supportedScannerModes: CameraService.getAvailableScannerModes(),
      supportedDocumentTypes: ['cheque', 'enach'],
    };
  }
}