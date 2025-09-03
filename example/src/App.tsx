import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import JustdialOCR from 'justdial-ocr-sdk';
import type { 
  ChequeOCRResult, 
  ENachOCRResult, 
  DocumentCaptureResult,
  MLKitTextRecognitionResult,
  DocumentScanResult
} from 'justdial-ocr-sdk';

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [chequeResult, setChequeResult] = useState<ChequeOCRResult | null>(null);
  const [enachResult, setEnachResult] = useState<ENachOCRResult | null>(null);
  const [documentCaptureResult, setDocumentCaptureResult] = useState<DocumentCaptureResult | null>(null);
  const [mlKitResult, setMLKitResult] = useState<MLKitTextRecognitionResult | null>(null);
  const [scanResult, setScanResult] = useState<DocumentScanResult | null>(null);
  const [sdkInfo, setSdkInfo] = useState<any>(null);

  useEffect(() => {
    initializeSDK();
  }, []);

  const initializeSDK = async () => {
    try {
      setLoading(true);
      const ocrSDK = JustdialOCR.getInstance();
      await ocrSDK.initialize();
      
      const info = ocrSDK.getSDKInfo();
      setSdkInfo(info);
      setIsInitialized(true);
      
      Alert.alert('Success', 'JustdialOCR SDK initialized successfully!');
    } catch (error) {
      console.error('SDK initialization failed:', error);
      Alert.alert('Error', `SDK initialization failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setSelectedImage(null);
    setChequeResult(null);
    setEnachResult(null);
    setDocumentCaptureResult(null);
    setMLKitResult(null);
    setScanResult(null);
  };

  const openDocumentScanner = async () => {
    try {
      setLoading(true);
      clearResults();
      
      const ocrSDK = JustdialOCR.getInstance();
      const result = await ocrSDK.openDocumentScanner({
        enableGalleryImport: true,
        scannerMode: 'full'
      });
      
      setScanResult(result);
      
      if (result.success && result.pages && result.pages.length > 0) {
        setSelectedImage(result.pages[0].imageUri);
        Alert.alert('Success', 'Document captured successfully!');
      } else {
        Alert.alert('Error', 'Failed to capture document');
      }
    } catch (error) {
      console.error('Document scanner failed:', error);
      Alert.alert('Error', `Scanner failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const openImagePicker = async () => {
    try {
      setLoading(true);
      clearResults();
      
      const ocrSDK = JustdialOCR.getInstance();
      const result = await ocrSDK.openImagePicker();
      
      setScanResult(result);
      
      if (result.success && result.pages && result.pages.length > 0) {
        setSelectedImage(result.pages[0].imageUri);
        Alert.alert('Success', 'Image selected successfully!');
      } else {
        Alert.alert('Error', 'Failed to select image');
      }
    } catch (error) {
      console.error('Image picker failed:', error);
      Alert.alert('Error', `Image picker failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const recognizeTextWithMLKit = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please capture or select an image first');
      return;
    }

    try {
      setLoading(true);
      const ocrSDK = JustdialOCR.getInstance();
      const result = await ocrSDK.recognizeTextFromImage(selectedImage);
      setMLKitResult(result);
      
      Alert.alert('Success', `ML Kit recognized ${result.textBlocks?.length || 0} text blocks`);
    } catch (error) {
      console.error('ML Kit text recognition failed:', error);
      Alert.alert('Error', `ML Kit failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const processCheque = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    try {
      setLoading(true);
      const ocrSDK = JustdialOCR.getInstance();
      const result = await ocrSDK.processCheque(selectedImage);
      setChequeResult(result);
      
      if (result.success) {
        Alert.alert('Success', 'Cheque processed successfully!');
      } else {
        Alert.alert('Error', result.error || 'Processing failed');
      }
    } catch (error) {
      console.error('Cheque processing failed:', error);
      Alert.alert('Error', `Processing failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const processENach = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    try {
      setLoading(true);
      const ocrSDK = JustdialOCR.getInstance();
      const result = await ocrSDK.processENach(selectedImage);
      setEnachResult(result);
      
      if (result.success) {
        Alert.alert('Success', 'e-NACH processed successfully!');
      } else {
        Alert.alert('Error', result.error || 'Processing failed');
      }
    } catch (error) {
      console.error('e-NACH processing failed:', error);
      Alert.alert('Error', `Processing failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const captureChequeComplete = async () => {
    try {
      setLoading(true);
      clearResults();
      
      const ocrSDK = JustdialOCR.getInstance();
      const result = await ocrSDK.captureCheque({
        enableGalleryImport: true,
        scannerMode: 'full'
      });
      
      setDocumentCaptureResult(result.captureResult);
      setChequeResult(result.ocrResult);
      
      if (result.captureResult.scanResult.pages && result.captureResult.scanResult.pages.length > 0) {
        setSelectedImage(result.captureResult.scanResult.pages[0].imageUri);
      }
      
      if (result.ocrResult.success) {
        Alert.alert('Success', 'Cheque captured and processed successfully!');
      } else {
        Alert.alert('Error', result.ocrResult.error || 'Processing failed');
      }
    } catch (error) {
      console.error('Complete cheque capture failed:', error);
      Alert.alert('Error', `Capture failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const captureENachComplete = async () => {
    try {
      setLoading(true);
      clearResults();
      
      const ocrSDK = JustdialOCR.getInstance();
      const result = await ocrSDK.captureENach({
        enableGalleryImport: true,
        scannerMode: 'full'
      });
      
      setDocumentCaptureResult(result.captureResult);
      setEnachResult(result.ocrResult);
      
      if (result.captureResult.scanResult.pages && result.captureResult.scanResult.pages.length > 0) {
        setSelectedImage(result.captureResult.scanResult.pages[0].imageUri);
      }
      
      if (result.ocrResult.success) {
        Alert.alert('Success', 'e-NACH captured and processed successfully!');
      } else {
        Alert.alert('Error', result.ocrResult.error || 'Processing failed');
      }
    } catch (error) {
      console.error('Complete e-NACH capture failed:', error);
      Alert.alert('Error', `Capture failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const captureDocumentAuto = async () => {
    try {
      setLoading(true);
      clearResults();
      
      const ocrSDK = JustdialOCR.getInstance();
      const result = await ocrSDK.captureDocument({
        enableGalleryImport: true,
        scannerMode: 'full',
        autoDetectDocumentType: true
      });
      
      setDocumentCaptureResult(result.captureResult);
      
      if (result.captureResult.scanResult.pages && result.captureResult.scanResult.pages.length > 0) {
        setSelectedImage(result.captureResult.scanResult.pages[0].imageUri);
      }

      // Set the appropriate result based on detected type
      if (result.documentType === 'cheque') {
        setChequeResult(result.ocrResult as ChequeOCRResult);
      } else if (result.documentType === 'enach') {
        setEnachResult(result.ocrResult as ENachOCRResult);
      }
      
      const successMessage = `Document captured and processed successfully!\nDetected: ${result.documentType}`;
      Alert.alert('Success', successMessage);
    } catch (error) {
      console.error('Auto capture failed:', error);
      Alert.alert('Error', `Auto capture failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>JustdialOCR SDK Demo</Text>
        <Text style={styles.subtitle}>Indian Cheque & e-NACH OCR</Text>
      </View>

      {sdkInfo && (
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>SDK Information</Text>
          <Text style={styles.infoText}>Version: {sdkInfo.version}</Text>
          <Text style={styles.infoText}>Initialized: {sdkInfo.isInitialized ? '✅' : '❌'}</Text>
          <Text style={styles.infoText}>Regional Compliance: {sdkInfo.regionalCompliance ? '✅ asia-south1' : '❌'}</Text>
          <Text style={styles.infoText}>ML Kit Available: {sdkInfo.mlKit?.available ? '✅' : '❌'}</Text>
          <Text style={styles.infoText}>Document Scanner: {sdkInfo.mlKit?.documentScannerAvailable ? '✅' : '❌'}</Text>
          <Text style={styles.infoText}>Supported Documents: {sdkInfo.supportedDocuments.join(', ')}</Text>
        </View>
      )}

      {/* Camera and Gallery Options */}
      <View style={styles.sectionCard}>
        <Text style={styles.cardTitle}>📷 Capture Options</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, styles.cameraButton]} onPress={openDocumentScanner}>
            <Text style={styles.buttonText}>📸 Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.galleryButton]} onPress={openImagePicker}>
            <Text style={styles.buttonText}>🖼️ Gallery</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Complete Capture & Process */}
      <View style={styles.sectionCard}>
        <Text style={styles.cardTitle}>🚀 Complete Capture & Process</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, styles.chequeButton]} 
            onPress={captureChequeComplete}
            disabled={loading || !isInitialized}
          >
            <Text style={styles.buttonText}>🏦 Capture Cheque</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.enachButton]} 
            onPress={captureENachComplete}
            disabled={loading || !isInitialized}
          >
            <Text style={styles.buttonText}>📄 Capture e-NACH</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={[styles.button, styles.autoButton]} 
          onPress={captureDocumentAuto}
          disabled={loading || !isInitialized}
        >
          <Text style={styles.buttonText}>🤖 Auto-Detect & Capture</Text>
        </TouchableOpacity>
      </View>

      {selectedImage && (
        <View style={styles.imageContainer}>
          <Text style={styles.cardTitle}>Selected Image</Text>
          <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
        </View>
      )}

      {selectedImage && (
        <View style={styles.sectionCard}>
          <Text style={styles.cardTitle}>🔍 Process Selected Image</Text>
          <TouchableOpacity 
            style={[styles.button, styles.mlkitButton]} 
            onPress={recognizeTextWithMLKit}
            disabled={loading || !isInitialized}
          >
            <Text style={styles.buttonText}>🤖 ML Kit Text Recognition</Text>
          </TouchableOpacity>
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]} 
              onPress={processCheque}
              disabled={loading || !isInitialized}
            >
              <Text style={styles.buttonText}>🏦 Process Cheque</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]} 
              onPress={processENach}
              disabled={loading || !isInitialized}
            >
              <Text style={styles.buttonText}>📄 Process e-NACH</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      )}

      {chequeResult && (
        <View style={styles.resultCard}>
          <Text style={styles.cardTitle}>Cheque OCR Result</Text>
          <Text style={styles.resultStatus}>
            Status: {chequeResult.success ? '✅ Success' : '❌ Failed'}
          </Text>
          {chequeResult.data && (
            <View style={styles.resultData}>
              <Text style={styles.resultText}>Bank: {chequeResult.data.bankName}</Text>
              <Text style={styles.resultText}>Account Holder: {chequeResult.data.accountHolderName}</Text>
              <Text style={styles.resultText}>Account Number: {chequeResult.data.accountNumber}</Text>
              <Text style={styles.resultText}>IFSC: {chequeResult.data.ifscCode}</Text>
              <Text style={styles.resultText}>Amount (Words): {chequeResult.data.amountInWords}</Text>
              <Text style={styles.resultText}>Amount (Numbers): {chequeResult.data.amountInNumbers}</Text>
              <Text style={styles.resultText}>Date: {chequeResult.data.date}</Text>
              <Text style={styles.resultText}>Confidence: {chequeResult.data.confidence}%</Text>
              {chequeResult.data.fraudIndicators.length > 0 && (
                <View style={styles.fraudAlert}>
                  <Text style={styles.fraudTitle}>⚠️ Fraud Indicators:</Text>
                  {chequeResult.data.fraudIndicators.map((indicator, index) => (
                    <Text key={index} style={styles.fraudText}>• {indicator}</Text>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {enachResult && (
        <View style={styles.resultCard}>
          <Text style={styles.cardTitle}>e-NACH OCR Result</Text>
          <Text style={styles.resultStatus}>
            Status: {enachResult.success ? '✅ Success' : '❌ Failed'}
          </Text>
          {enachResult.data && (
            <View style={styles.resultData}>
              <Text style={styles.resultText}>Utility: {enachResult.data.utilityName}</Text>
              <Text style={styles.resultText}>Account Holder: {enachResult.data.accountHolderName}</Text>
              <Text style={styles.resultText}>Bank: {enachResult.data.bankName}</Text>
              <Text style={styles.resultText}>Account Number: {enachResult.data.accountNumber}</Text>
              <Text style={styles.resultText}>IFSC: {enachResult.data.ifscCode}</Text>
              <Text style={styles.resultText}>Max Amount: {enachResult.data.maxAmount}</Text>
              <Text style={styles.resultText}>Frequency: {enachResult.data.frequency}</Text>
              <Text style={styles.resultText}>Start Date: {enachResult.data.startDate}</Text>
              <Text style={styles.resultText}>End Date: {enachResult.data.endDate}</Text>
              <Text style={styles.resultText}>Confidence: {enachResult.data.confidence}%</Text>
            </View>
          )}
        </View>
      )}

      {mlKitResult && (
        <View style={styles.resultCard}>
          <Text style={styles.cardTitle}>🤖 ML Kit Results</Text>
          <Text style={styles.resultText}>Text Blocks: {mlKitResult.textBlocks?.length || 0}</Text>
          <ScrollView style={styles.textScrollView} nestedScrollEnabled>
            <Text style={styles.extractedText}>{mlKitResult.fullText}</Text>
          </ScrollView>
        </View>
      )}

      {documentCaptureResult && (
        <View style={styles.resultCard}>
          <Text style={styles.cardTitle}>📊 Capture Statistics</Text>
          <Text style={styles.resultText}>Processing Time: {documentCaptureResult.processingTime}ms</Text>
          <Text style={styles.resultText}>Document Type: {documentCaptureResult.detectedDocumentType || 'Unknown'}</Text>
          <Text style={styles.resultText}>ML Kit Blocks: {documentCaptureResult.mlKitResult.textBlocks?.length || 0}</Text>
        </View>
      )}

      {scanResult && (
        <View style={styles.resultCard}>
          <Text style={styles.cardTitle}>📷 Scan Information</Text>
          <Text style={styles.resultStatus}>
            Status: {scanResult.success ? '✅ Success' : '❌ Failed'}
          </Text>
          <Text style={styles.resultText}>Pages Captured: {scanResult.pages?.length || 0}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  infoCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  sectionCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  cameraButton: {
    backgroundColor: '#FF5722',
  },
  galleryButton: {
    backgroundColor: '#9C27B0',
  },
  chequeButton: {
    backgroundColor: '#4CAF50',
  },
  enachButton: {
    backgroundColor: '#FF9800',
  },
  autoButton: {
    backgroundColor: '#E91E63',
    marginTop: 10,
  },
  mlkitButton: {
    backgroundColor: '#607D8B',
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
  },
  secondaryButton: {
    backgroundColor: '#FF9800',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  imageContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  selectedImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    resizeMode: 'contain',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  resultCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  resultStatus: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultData: {
    marginTop: 10,
  },
  resultText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#444',
  },
  fraudAlert: {
    backgroundColor: '#FFF3CD',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  fraudTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 5,
  },
  fraudText: {
    fontSize: 14,
    color: '#E65100',
    marginBottom: 2,
  },
  textScrollView: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    padding: 8,
    backgroundColor: '#F9F9F9',
  },
  extractedText: {
    fontSize: 12,
    color: '#333',
    lineHeight: 18,
  },
});
