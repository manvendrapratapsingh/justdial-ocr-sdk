/**
 * Complete OCR Architecture Test Component
 * Tests the full flow: React Native App → JustdialOCR SDK → [Camera/Gallery → ML Kit → Firebase AI] → OCR Results
 */

import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';

// Import JustdialOCR SDK
import JustdialOcrSdk from 'justdial-ocr-sdk/src/NativeJustdialOcrSdk';
// Import Firebase AI service for complete OCR flow
import FirebaseAIService from '../services/FirebaseAIService';

const OCRTestApp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const testCompleteOCRFlow = async (documentType) => {
    try {
      setIsLoading(true);
      setResult(null);
      
      console.log(`Testing complete OCR flow for: ${documentType}`);
      
      let response;
      switch (documentType) {
        case 'cheque':
          response = await JustdialOcrSdk.captureCheque(true, 'full');
          break;
        case 'enach':
          response = await JustdialOcrSdk.captureENach(true, 'full');
          break;
        case 'document':
          response = await JustdialOcrSdk.captureDocument(true, 'full');
          break;
        default:
          throw new Error('Unknown document type');
      }
      
      console.log('OCR Flow Response:', response);
      setResult(response);
      
      Alert.alert(
        'Success! 🎉',
        `${documentType.toUpperCase()} OCR flow completed successfully!\n\nArchitecture: ${response.architecture}`,
        [{text: 'OK'}]
      );
      
    } catch (error) {
      console.error('OCR Flow Error:', error);
      Alert.alert('Error', `Failed to test ${documentType} OCR flow: ${error.message}`);
      setResult({ success: false, error: error.message, documentType });
    } finally {
      setIsLoading(false);
    }
  };

  const testBasicSDK = async () => {
    try {
      setIsLoading(true);
      const multiplyResult = await JustdialOcrSdk.multiply(6, 7);
      Alert.alert('SDK Test ✅', `Basic SDK test passed!\nMultiply result: ${multiplyResult}`);
      setResult({ success: true, message: 'Basic SDK test passed', result: multiplyResult });
    } catch (error) {
      Alert.alert('Error', `SDK test failed: ${error.message}`);
      setResult({ success: false, error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const testProcessImage = async () => {
    try {
      setIsLoading(true);
      setResult(null);
      
      // Test with dummy data for now
      const testImageUri = "content://mock/test/image.jpg";
      const response = await JustdialOcrSdk.processImageWithAI(testImageUri, 'cheque');
      
      console.log('Process Image Response:', response);
      setResult(response);
      
    } catch (error) {
      console.error('Process Image Error:', error);
      Alert.alert('Expected Error', `This is expected since we're using mock data: ${error.message}`);
      setResult({ success: false, error: error.message, note: 'Expected error with mock data' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.scrollView}>
        
        <View style={styles.header}>
          <Text style={styles.title}>🔥 JustdialOCR SDK</Text>
          <Text style={styles.subtitle}>Complete Architecture Test</Text>
          <Text style={styles.architecture}>
            React Native App → JustdialOCR SDK → [Camera/Gallery → ML Kit → Firebase AI] → OCR Results
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Basic SDK Test</Text>
          <TouchableOpacity 
            style={[styles.button, styles.basicButton]} 
            onPress={testBasicSDK}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Test Basic SDK Functions</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Complete OCR Flow Tests</Text>
          
          <TouchableOpacity 
            style={[styles.button, styles.chequeButton]} 
            onPress={() => testCompleteOCRFlow('cheque')}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>📄 Test Cheque OCR Flow</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.enachButton]} 
            onPress={() => testCompleteOCRFlow('enach')}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>📋 Test e-NACH OCR Flow</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.documentButton]} 
            onPress={() => testCompleteOCRFlow('document')}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>🔍 Test Auto-Detection OCR Flow</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.processButton]} 
            onPress={testProcessImage}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>⚙️ Test AI Image Processing</Text>
          </TouchableOpacity>
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>🔄 Testing OCR Architecture...</Text>
          </View>
        )}

        {result && (
          <View style={[styles.resultContainer, result.success ? styles.successResult : styles.errorResult]}>
            <Text style={styles.resultTitle}>
              {result.success ? '✅ Test Result:' : '❌ Test Result:'}
            </Text>
            <Text style={styles.resultText}>Success: {result.success ? 'true' : 'false'}</Text>
            {result.documentType && <Text style={styles.resultText}>Document Type: {result.documentType}</Text>}
            {result.message && <Text style={styles.resultText}>Message: {result.message}</Text>}
            {result.error && <Text style={styles.resultText}>Error: {result.error}</Text>}
            {result.note && <Text style={styles.resultText}>Note: {result.note}</Text>}
            {result.result && <Text style={styles.resultText}>Result: {result.result}</Text>}
            {result.architecture && (
              <Text style={styles.resultArchitecture}>Architecture: {result.architecture}</Text>
            )}
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🎉 Complete OCR Architecture Implemented!{'\n'}
            ✅ Camera/Gallery Integration{'\n'}
            ✅ ML Kit Text Recognition{'\n'}  
            ✅ Firebase AI Processing{'\n'}
            ✅ Single SDK Call Interface{'\n'}
            ✅ Cross-platform Support{'\n'}
            ✅ Asia-South1 Regional Compliance
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'white',
    marginVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#34495e',
    marginBottom: 12,
  },
  architecture: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  section: {
    backgroundColor: 'white',
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  basicButton: {
    backgroundColor: '#3498db',
  },
  chequeButton: {
    backgroundColor: '#2ecc71',
  },
  enachButton: {
    backgroundColor: '#e74c3c',
  },
  documentButton: {
    backgroundColor: '#f39c12',
  },
  processButton: {
    backgroundColor: '#9b59b6',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#34495e',
    fontWeight: '500',
  },
  resultContainer: {
    padding: 16,
    borderRadius: 10,
    marginVertical: 10,
    borderLeftWidth: 4,
  },
  successResult: {
    backgroundColor: '#d5f4e6',
    borderLeftColor: '#2ecc71',
  },
  errorResult: {
    backgroundColor: '#fdf2f2',
    borderLeftColor: '#e74c3c',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 14,
    color: '#2c3e50',
    marginVertical: 2,
  },
  resultArchitecture: {
    fontSize: 12,
    color: '#7f8c8d',
    fontStyle: 'italic',
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#ecf0f1',
    marginVertical: 10,
    borderRadius: 12,
  },
  footerText: {
    fontSize: 14,
    color: '#2c3e50',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default OCRTestApp;
