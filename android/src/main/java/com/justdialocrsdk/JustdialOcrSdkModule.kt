package com.justdialocrsdk

import android.app.Activity
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.util.Base64
import android.util.Log
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.IntentSenderRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.module.annotations.ReactModule
import com.google.android.gms.common.moduleinstall.ModuleInstall
import com.google.android.gms.common.moduleinstall.ModuleInstallRequest
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import com.google.mlkit.vision.documentscanner.GmsDocumentScannerOptions
import com.google.mlkit.vision.documentscanner.GmsDocumentScanning
import com.google.mlkit.vision.documentscanner.GmsDocumentScanningResult
import java.io.ByteArrayOutputStream
import java.io.File
import kotlin.math.min

@ReactModule(name = JustdialOcrSdkModule.NAME)
class JustdialOcrSdkModule(reactContext: ReactApplicationContext) :
  NativeJustdialOcrSdkSpec(reactContext), ActivityEventListener {

  private var documentScannerPromise: Promise? = null
  private var mlKitTextPromise: Promise? = null
  private val textRecognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)
  
  companion object {
    const val NAME = "JustdialOcrSdk"
    private const val TAG = "JustdialOcrSdk"
    private const val DOCUMENT_SCANNER_REQUEST_CODE = 1001
  }

  init {
    reactApplicationContext.addActivityEventListener(this)
  }

  override fun getName(): String {
    return NAME
  }

  override fun onActivityResult(activity: Activity?, requestCode: Int, resultCode: Int, intent: Intent?) {
    when (requestCode) {
      DOCUMENT_SCANNER_REQUEST_CODE -> {
        handleDocumentScannerResult(resultCode, intent)
      }
    }
  }

  override fun onNewIntent(intent: Intent?) {
    // Handle new intent if needed
  }

  @ReactMethod
  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }

  @ReactMethod
  fun optimizeImage(imageUri: String, maxDimension: Double, promise: Promise) {
    try {
      val uri = Uri.parse(imageUri)
      val inputStream = reactApplicationContext.contentResolver.openInputStream(uri)
      val originalBitmap = BitmapFactory.decodeStream(inputStream)
      inputStream?.close()

      if (originalBitmap == null) {
        promise.reject("IMAGE_DECODE_ERROR", "Failed to decode image")
        return
      }

      // Calculate optimal dimensions maintaining aspect ratio
      val maxDim = maxDimension.toInt()
      val aspectRatio = originalBitmap.width.toFloat() / originalBitmap.height.toFloat()
      
      val newWidth: Int
      val newHeight: Int
      
      if (originalBitmap.width > originalBitmap.height) {
        newWidth = min(originalBitmap.width, maxDim)
        newHeight = (newWidth / aspectRatio).toInt()
      } else {
        newHeight = min(originalBitmap.height, maxDim)
        newWidth = (newHeight * aspectRatio).toInt()
      }

      // Resize bitmap
      val resizedBitmap = Bitmap.createScaledBitmap(originalBitmap, newWidth, newHeight, true)
      
      // Convert to base64
      val byteArrayOutputStream = ByteArrayOutputStream()
      resizedBitmap.compress(Bitmap.CompressFormat.JPEG, 85, byteArrayOutputStream)
      val byteArray = byteArrayOutputStream.toByteArray()
      val base64String = Base64.encodeToString(byteArray, Base64.NO_WRAP)

      // Cleanup
      originalBitmap.recycle()
      resizedBitmap.recycle()
      byteArrayOutputStream.close()

      promise.resolve(base64String)
    } catch (e: Exception) {
      promise.reject("IMAGE_OPTIMIZATION_ERROR", "Failed to optimize image: ${e.message}")
    }
  }

  @ReactMethod 
  fun validateImage(imageUri: String, maxFileSizeBytes: Double, promise: Promise) {
    try {
      val uri = Uri.parse(imageUri)
      val file = File(uri.path ?: "")
      
      val result: WritableMap = WritableNativeMap()
      
      if (!file.exists()) {
        result.putBoolean("isValid", false)
        result.putString("error", "File does not exist")
        promise.resolve(result)
        return
      }

      val fileSize = file.length()
      if (fileSize > maxFileSizeBytes) {
        result.putBoolean("isValid", false)
        result.putString("error", "File size exceeds limit")
        promise.resolve(result)
        return
      }

      // Check if it's a valid image
      val inputStream = reactApplicationContext.contentResolver.openInputStream(uri)
      val bitmap = BitmapFactory.decodeStream(inputStream)
      inputStream?.close()

      if (bitmap == null) {
        result.putBoolean("isValid", false)
        result.putString("error", "Invalid image format")
      } else {
        result.putBoolean("isValid", true)
        bitmap.recycle()
      }

      promise.resolve(result)
    } catch (e: Exception) {
      val result: WritableMap = WritableNativeMap()
      result.putBoolean("isValid", false)
      result.putString("error", "Validation failed: ${e.message}")
      promise.resolve(result)
    }
  }

  @ReactMethod
  fun getImageDimensions(imageUri: String, promise: Promise) {
    try {
      val uri = Uri.parse(imageUri)
      val inputStream = reactApplicationContext.contentResolver.openInputStream(uri)
      val options = BitmapFactory.Options().apply {
        inJustDecodeBounds = true
      }
      BitmapFactory.decodeStream(inputStream, null, options)
      inputStream?.close()

      val result: WritableMap = WritableNativeMap()
      result.putInt("width", options.outWidth)
      result.putInt("height", options.outHeight)
      
      promise.resolve(result)
    } catch (e: Exception) {
      promise.reject("DIMENSIONS_ERROR", "Failed to get image dimensions: ${e.message}")
    }
  }

  @ReactMethod
  fun openDocumentScanner(enableGalleryImport: Boolean, scannerMode: String, promise: Promise) {
    try {
      documentScannerPromise = promise
      
      val options = GmsDocumentScannerOptions.Builder()
        .setGalleryImportAllowed(enableGalleryImport)
        .setPageLimit(1)
        .setResultFormats(GmsDocumentScannerOptions.RESULT_FORMAT_JPEG)
        .setScannerMode(
          when (scannerMode.lowercase()) {
            "full" -> GmsDocumentScannerOptions.SCANNER_MODE_FULL
            "base_with_filter" -> GmsDocumentScannerOptions.SCANNER_MODE_BASE_WITH_FILTER
            else -> GmsDocumentScannerOptions.SCANNER_MODE_BASE
          }
        )
        .build()

      val scanner = GmsDocumentScanning.getClient(options)
      val scannerIntent = scanner.getStartScanIntent(reactApplicationContext.currentActivity as Activity)
      
      scannerIntent.addOnSuccessListener { intentSender ->
        try {
          reactApplicationContext.currentActivity?.startIntentSenderForResult(
            intentSender,
            DOCUMENT_SCANNER_REQUEST_CODE,
            null,
            0,
            0,
            0
          )
        } catch (e: Exception) {
          promise.reject("SCANNER_START_ERROR", "Failed to start document scanner", e)
          documentScannerPromise = null
        }
      }.addOnFailureListener { e ->
        promise.reject("SCANNER_INIT_ERROR", "Failed to initialize document scanner", e)
        documentScannerPromise = null
      }
      
    } catch (e: Exception) {
      promise.reject("DOCUMENT_SCANNER_ERROR", "Failed to open document scanner: ${e.message}")
      documentScannerPromise = null
    }
  }

  @ReactMethod
  fun recognizeTextFromImage(imageUri: String, promise: Promise) {
    try {
      mlKitTextPromise = promise
      
      val uri = Uri.parse(imageUri)
      val inputStream = reactApplicationContext.contentResolver.openInputStream(uri)
      val bitmap = BitmapFactory.decodeStream(inputStream)
      inputStream?.close()

      if (bitmap == null) {
        promise.reject("IMAGE_DECODE_ERROR", "Failed to decode image")
        return
      }

      val image = InputImage.fromBitmap(bitmap, 0)
      
      textRecognizer.process(image)
        .addOnSuccessListener { visionText ->
          val result: WritableMap = WritableNativeMap()
          result.putString("fullText", visionText.text)
          
          val blocks: WritableArray = WritableNativeArray()
          for (block in visionText.textBlocks) {
            val blockData: WritableMap = WritableNativeMap()
            blockData.putString("text", block.text)
            
            val boundingBox = block.boundingBox
            if (boundingBox != null) {
              val bounds: WritableMap = WritableNativeMap()
              bounds.putInt("left", boundingBox.left)
              bounds.putInt("top", boundingBox.top)
              bounds.putInt("right", boundingBox.right)
              bounds.putInt("bottom", boundingBox.bottom)
              blockData.putMap("boundingBox", bounds)
            }
            
            val lines: WritableArray = WritableNativeArray()
            for (line in block.lines) {
              val lineData: WritableMap = WritableNativeMap()
              lineData.putString("text", line.text)
              
              val elements: WritableArray = WritableNativeArray()
              for (element in line.elements) {
                val elementData: WritableMap = WritableNativeMap()
                elementData.putString("text", element.text)
                elements.pushMap(elementData)
              }
              lineData.putArray("elements", elements)
              lines.pushMap(lineData)
            }
            blockData.putArray("lines", lines)
            blocks.pushMap(blockData)
          }
          
          result.putArray("textBlocks", blocks)
          promise.resolve(result)
          mlKitTextPromise = null
        }
        .addOnFailureListener { e ->
          promise.reject("TEXT_RECOGNITION_ERROR", "Failed to recognize text: ${e.message}")
          mlKitTextPromise = null
        }
        
    } catch (e: Exception) {
      promise.reject("ML_KIT_ERROR", "Failed to process image with ML Kit: ${e.message}")
      mlKitTextPromise = null
    }
  }

  @ReactMethod
  fun installMLKitModules(promise: Promise) {
    val moduleInstallClient = ModuleInstall.getClient(reactApplicationContext)
    val moduleInstallRequest = ModuleInstallRequest.newBuilder()
      .addApi(GmsDocumentScanning.getClient(GmsDocumentScannerOptions.Builder().build()))
      .build()

    moduleInstallClient.installModules(moduleInstallRequest)
      .addOnSuccessListener {
        Log.d(TAG, "ML Kit modules installed successfully")
        promise.resolve("ML Kit modules installed successfully")
      }
      .addOnFailureListener { e ->
        Log.e(TAG, "Failed to install ML Kit modules", e)
        promise.reject("MODULE_INSTALL_ERROR", "Failed to install ML Kit modules: ${e.message}")
      }
  }

  private fun handleDocumentScannerResult(resultCode: Int, data: Intent?) {
    val promise = documentScannerPromise ?: return
    documentScannerPromise = null

    if (resultCode == Activity.RESULT_OK && data != null) {
      val result = GmsDocumentScanningResult.fromActivityResultIntent(data)
      result?.let { scanResult ->
        try {
          val resultMap: WritableMap = WritableNativeMap()
          val pages: WritableArray = WritableNativeArray()
          
          scanResult.pages?.let { pageList ->
            for (page in pageList) {
              val pageData: WritableMap = WritableNativeMap()
              pageData.putString("imageUri", page.imageUri.toString())
              pages.pushMap(pageData)
            }
          }
          
          resultMap.putArray("pages", pages)
          resultMap.putBoolean("success", true)
          promise.resolve(resultMap)
        } catch (e: Exception) {
          promise.reject("RESULT_PROCESSING_ERROR", "Failed to process scan result: ${e.message}")
        }
      } ?: run {
        promise.reject("NULL_RESULT_ERROR", "Document scanner returned null result")
      }
    } else {
      promise.reject("SCANNER_CANCELLED", "Document scanner was cancelled or failed")
    }
  }

  companion object {
    const val NAME = "JustdialOcrSdk"
  }
}
