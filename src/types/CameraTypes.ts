export type ScannerMode = 'base' | 'base_with_filter' | 'full';

export interface CameraOptions {
  enableGalleryImport?: boolean;
  scannerMode?: ScannerMode;
  autoDetectDocumentType?: boolean;
}

export interface DocumentScanResult {
  success: boolean;
  pages?: Array<{
    imageUri: string;
  }>;
  error?: string;
}

export interface TextBlock {
  text: string;
  boundingBox?: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
  lines?: Array<{
    text: string;
    elements?: Array<{
      text: string;
    }>;
  }>;
}

export interface MLKitTextRecognitionResult {
  fullText: string;
  textBlocks: TextBlock[];
}

export interface CameraPermissionStatus {
  camera: 'granted' | 'denied' | 'restricted' | 'undetermined';
  photos?: 'granted' | 'denied' | 'restricted' | 'undetermined';
}

export interface DocumentCaptureResult {
  scanResult: DocumentScanResult;
  mlKitResult: MLKitTextRecognitionResult;
  detectedDocumentType?: 'cheque' | 'enach' | 'unknown';
  processingTime: number;
}