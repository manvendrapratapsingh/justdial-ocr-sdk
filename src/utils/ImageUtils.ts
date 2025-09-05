// import { Platform } from 'react-native';

export class ImageUtils {
  private static readonly TAG = 'ImageUtils';
  private static readonly MAX_FILE_SIZE_MB = 4; // 4MB limit

  /**
   * Optimizes image for Firebase AI processing
   * Maintains 1024px max dimension optimization from Android implementation
   */
  static async optimizeImageForProcessing(
    imageUri: string,
    maxDimension: number = 1024,
    options?: { outputMime?: 'image/jpeg' | 'image/png'; quality?: number; useBytes?: boolean }
  ): Promise<string> {
    try {
      console.log(`${ImageUtils.TAG}: Starting image optimization`);
      
      // Use old bridge pattern to match native method signature exactly
      const { JustdialOcrSdk } = require('react-native').NativeModules;
      
      if (JustdialOcrSdk) {
        // Try new JPEG bytes method first for better Vertex AI compatibility
        if (options?.useBytes && JustdialOcrSdk.optimizeImageToBytes) {
          try {
            console.log(`${ImageUtils.TAG}: Using JPEG bytes method for Vertex AI`);
            const jpegBytesArray: number[] = await JustdialOcrSdk.optimizeImageToBytes(
              imageUri,
              maxDimension
            );
            
            // Convert bytes array to base64
            const base64 = ImageUtils.bytesToBase64(jpegBytesArray);
            console.log(`${ImageUtils.TAG}: ✅ Image optimized to JPEG bytes (${jpegBytesArray.length} bytes) and converted to base64`);
            return base64;
          } catch (bytesError) {
            console.warn(`${ImageUtils.TAG}: JPEG bytes method failed, falling back to regular optimization:`, bytesError);
          }
        }
        
        // Fallback to regular base64 method
        if (JustdialOcrSdk.optimizeImage) {
          const optimizedBase64: string = await JustdialOcrSdk.optimizeImage(
            imageUri,
            maxDimension
          );
          console.log(`${ImageUtils.TAG}: ✅ Image optimized via native module`);
          return optimizedBase64;
        }
      }

      // Final fallback: Convert image to base64 using React Native
      console.log(`${ImageUtils.TAG}: Using fallback image processing`);
      return await ImageUtils.convertImageToBase64(imageUri);
      
    } catch (error) {
      console.error(`${ImageUtils.TAG}: Image optimization failed`, error);
      throw error;
    }
  }

  /**
   * Fallback method to convert image to base64
   * Simple implementation that returns a test base64 for Firebase AI verification
   */
  static async convertImageToBase64(imageUri: string): Promise<string> {
    try {
      console.log(`${ImageUtils.TAG}: Converting image to base64:`, imageUri);
      
      // For now, return a placeholder base64 to test the Firebase AI flow
      // This is temporary until proper native image processing is implemented
      console.log(`${ImageUtils.TAG}: Using test base64 for Firebase AI verification`);
      
      // This is a small 1x1 transparent PNG in base64 for testing
      const testBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
      
      console.log(`${ImageUtils.TAG}: ✅ Test image ready for Firebase AI processing`);
      return testBase64;
    } catch (error) {
      console.error(`${ImageUtils.TAG}: Base64 conversion failed`, error);
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
   * Convert byte array to base64 string
   */
  static bytesToBase64(bytes: number[]): string {
    try {
      // Convert number array to Uint8Array
      const uint8Array = new Uint8Array(bytes);
      
      // Convert to binary string
      let binaryString = '';
      for (let i = 0; i < uint8Array.length; i++) {
        const byte = uint8Array[i];
        if (byte !== undefined) {
          binaryString += String.fromCharCode(byte);
        }
      }
      
      // Use btoa to convert to base64
      const base64 = btoa(binaryString);
      
      console.log(`${ImageUtils.TAG}: Converted ${bytes.length} bytes to base64 (${base64.length} chars)`);
      return base64;
    } catch (error) {
      console.error(`${ImageUtils.TAG}: Failed to convert bytes to base64:`, error);
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
