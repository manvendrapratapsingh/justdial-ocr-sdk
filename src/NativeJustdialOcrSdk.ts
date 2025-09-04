import { TurboModuleRegistry, type TurboModule } from 'react-native';

export interface Spec extends TurboModule {
  multiply(a: number, b: number): number;
  
  // Image processing methods
  optimizeImage(imageUri: string, maxDimension: number): Promise<string>;
  validateImage(imageUri: string, maxFileSizeBytes: number): Promise<{isValid: boolean; error?: string}>;
  getImageDimensions(imageUri: string): Promise<{width: number; height: number}>;
  
  // ML Kit document scanner
  openDocumentScanner(enableGalleryImport: boolean, scannerMode: string): Promise<{
    success: boolean;
    pages?: Array<{imageUri: string}>;
  }>;
  
  // ML Kit text recognition
  recognizeTextFromImage(imageUri: string): Promise<{
    fullText: string;
    textBlocks: Array<{
      text: string;
      boundingBox?: {left: number; top: number; right: number; bottom: number};
      lines: Array<{
        text: string;
        elements: Array<{text: string}>;
      }>;
    }>;
  }>;
  
  // ML Kit module installation
  installMLKitModules(): Promise<string>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('JustdialOcrSdk');
