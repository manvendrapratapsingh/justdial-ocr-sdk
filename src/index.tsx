// Main SDK Export
export { default } from './JustdialOCR';
export { default as JustdialOCR } from './JustdialOCR';

// Services Export
export { FirebaseAIService } from './services/FirebaseAIService';
export { DocumentProcessorService } from './services/DocumentProcessorService';

// Types Export
export type * from './types';

// Utilities Export  
export { ImageUtils } from './utils/ImageUtils';

// Native Module Access (for advanced users)
export { default as NativeJustdialOcrSdk } from './NativeJustdialOcrSdk';

// Legacy multiply function for compatibility
import JustdialOcrSdk from './NativeJustdialOcrSdk';

export function multiply(a: number, b: number): number {
  return JustdialOcrSdk.multiply(a, b);
}
