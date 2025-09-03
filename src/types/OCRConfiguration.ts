export interface OCRConfiguration {
  region: 'asia-south1';
  temperature: number;
  maxOutputTokens: number;
  responseMimeType: 'application/json';
  maxImageDimension: number;
  enableFraudDetection: boolean;
  enableCrossValidation: boolean;
}

export interface OCRValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface OCRProcessingOptions {
  enablePreprocessing?: boolean;
  enableValidation?: boolean;
  enableFraudDetection?: boolean;
  timeout?: number;
}