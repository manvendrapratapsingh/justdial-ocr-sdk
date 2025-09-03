import { Platform } from 'react-native';

export class ImageUtils {
  private static readonly TAG = 'ImageUtils';
  private static readonly MAX_FILE_SIZE_MB = 4; // 4MB limit

  /**
   * Optimizes image for Firebase AI processing
   * Maintains 1024px max dimension optimization from Android implementation
   */
  static async optimizeImageForProcessing(
    imageUri: string, 
    maxDimension: number = 1024
  ): Promise<string> {
    try {
      console.log(`${ImageUtils.TAG}: Starting image optimization`);
      
      // For React Native, we need to use native modules for image processing
      // This is a placeholder that will be implemented in native modules
      const { JustdialOcrSdk } = require('react-native').NativeModules;
      
      if (!JustdialOcrSdk) {
        throw new Error('Native module not available');
      }

      const optimizedBase64 = await JustdialOcrSdk.optimizeImage(imageUri, maxDimension);
      
      console.log(`${ImageUtils.TAG}: ✅ Image optimized successfully`);
      return optimizedBase64;
    } catch (error) {
      console.error(`${ImageUtils.TAG}: Image optimization failed`, error);
      throw error;
    }
  }

  /**
   * Validates image format and size
   */
  static async validateImage(imageUri: string): Promise<boolean> {
    try {
      const { JustdialOcrSdk } = require('react-native').NativeModules;
      
      if (!JustdialOcrSdk) {
        throw new Error('Native module not available');
      }

      const validation = await JustdialOcrSdk.validateImage(
        imageUri, 
        ImageUtils.MAX_FILE_SIZE_MB * 1024 * 1024
      );
      
      return validation.isValid;
    } catch (error) {
      console.error(`${ImageUtils.TAG}: Image validation failed`, error);
      return false;
    }
  }

  /**
   * Gets image dimensions
   */
  static async getImageDimensions(imageUri: string): Promise<{ width: number; height: number }> {
    try {
      const { JustdialOcrSdk } = require('react-native').NativeModules;
      
      if (!JustdialOcrSdk) {
        throw new Error('Native module not available');
      }

      return await JustdialOcrSdk.getImageDimensions(imageUri);
    } catch (error) {
      console.error(`${ImageUtils.TAG}: Getting image dimensions failed`, error);
      throw error;
    }
  }

  /**
   * Calculates optimal dimensions maintaining aspect ratio
   */
  static calculateOptimalDimensions(
    originalWidth: number, 
    originalHeight: number, 
    maxDimension: number
  ): { width: number; height: number } {
    if (originalWidth <= maxDimension && originalHeight <= maxDimension) {
      return { width: originalWidth, height: originalHeight };
    }

    const aspectRatio = originalWidth / originalHeight;
    
    if (originalWidth > originalHeight) {
      return {
        width: maxDimension,
        height: Math.round(maxDimension / aspectRatio),
      };
    } else {
      return {
        width: Math.round(maxDimension * aspectRatio),
        height: maxDimension,
      };
    }
  }
}