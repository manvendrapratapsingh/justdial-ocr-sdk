package com.justdialocrsdk

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.Promise

/**
 * TurboModule specification for JustdialOcrSdk
 * This is the base class that defines the interface for the native module
 */
abstract class NativeJustdialOcrSdkSpec(reactContext: ReactApplicationContext) : 
  ReactContextBaseJavaModule(reactContext) {

  // Legacy multiply function for compatibility
  abstract fun multiply(a: Double, b: Double): Double

  // Image processing methods
  abstract fun optimizeImage(imageUri: String, maxDimension: Double, promise: Promise)
  abstract fun optimizeImageToBytes(imageUri: String, maxDimension: Double, promise: Promise)
  abstract fun validateImage(imageUri: String, maxFileSizeBytes: Double, promise: Promise)  
  abstract fun getImageDimensions(imageUri: String, promise: Promise)

  // ML Kit document scanner
  abstract fun openDocumentScanner(enableGalleryImport: Boolean, scannerMode: String, promise: Promise)

  // ML Kit text recognition
  abstract fun recognizeTextFromImage(imageUri: String, promise: Promise)

  // ML Kit module installation
  abstract fun installMLKitModules(promise: Promise)

  // Complete OCR flow methods (Camera/Gallery → ML Kit → Firebase AI → Results)
  abstract fun captureCheque(enableGalleryImport: Boolean, scannerMode: String, promise: Promise)
  abstract fun captureENach(enableGalleryImport: Boolean, scannerMode: String, promise: Promise)
  abstract fun captureDocument(enableGalleryImport: Boolean, scannerMode: String, promise: Promise)
  
  // Process existing image with complete OCR pipeline
  abstract fun processImageWithAI(imageUri: String, documentType: String, promise: Promise)
}
