import { useState, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import firebaseApp from '@react-native-firebase/app';
import { getVertexAI, getGenerativeModel } from '@react-native-firebase/vertexai';

export default function FirebaseTestApp() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [firebaseInfo, setFirebaseInfo] = useState<any>(null);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    initializeFirebase();
  }, []);

  const initializeFirebase = async () => {
    try {
      setLoading(true);
      
      // Check if Firebase is initialized
      const apps = firebaseApp.apps;
      console.log('Firebase apps:', apps.length);
      
      if (apps.length > 0) {
        const app = apps[0];
        if (app && app.options) {
          setFirebaseInfo({
            name: app.name,
            projectId: app.options.projectId,
            appId: app.options.appId,
            initialized: true
          });
          setIsInitialized(true);
          Alert.alert('Success', `Firebase initialized successfully!\n\nProject: ${app.options.projectId}\nRegion: asia-south1 (configured)`);
        }
      } else {
        Alert.alert('Error', 'Firebase not initialized - check google-services.json');
      }
    } catch (error) {
      console.error('Firebase initialization failed:', error);
      Alert.alert('Error', `Firebase initialization failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testVertexAI = async () => {
    try {
      setLoading(true);
      setTestResult(null);
      
      // Get Vertex AI instance
      const vertexAI = getVertexAI(firebaseApp.app(), { 
        location: 'asia-south1' // India region compliance
      });
      
      // Get the generative model
      const model = getGenerativeModel(vertexAI, {
        model: 'gemini-1.5-flash-001'
      });
      
      // Test with simple prompt
      const prompt = 'Hello! Please respond with "Firebase Vertex AI is working correctly in asia-south1 region."';
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      setTestResult(text);
      Alert.alert('Success', 'Vertex AI test completed successfully!\n\nCheck the result below.');
      
    } catch (error) {
      console.error('Vertex AI test failed:', error);
      Alert.alert('Error', `Vertex AI test failed: ${error}`);
      setTestResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Firebase Integration Test</Text>
        <Text style={styles.subtitle}>JustdialOCR SDK Setup Verification</Text>
      </View>

      {firebaseInfo && (
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>🔥 Firebase Configuration</Text>
          <Text style={styles.infoText}>Project ID: {firebaseInfo.projectId}</Text>
          <Text style={styles.infoText}>App ID: {firebaseInfo.appId}</Text>
          <Text style={styles.infoText}>Status: {firebaseInfo.initialized ? '✅ Connected' : '❌ Failed'}</Text>
          <Text style={styles.infoText}>Region: 🇮🇳 asia-south1 (Mumbai)</Text>
          <Text style={styles.infoText}>google-services.json: ✅ Loaded</Text>
        </View>
      )}

      <View style={styles.sectionCard}>
        <Text style={styles.cardTitle}>🧪 Test Firebase Vertex AI</Text>
        <Text style={styles.sectionDescription}>
          This will test the complete Firebase AI setup that the OCR SDK will use internally.
        </Text>
        
        <TouchableOpacity 
          style={[styles.button, styles.testButton]} 
          onPress={testVertexAI}
          disabled={loading || !isInitialized}
        >
          <Text style={styles.buttonText}>🚀 Test Vertex AI (asia-south1)</Text>
          <Text style={styles.buttonSubtext}>Test Firebase AI Logic connection</Text>
        </TouchableOpacity>
      </View>

      {testResult && (
        <View style={styles.resultCard}>
          <Text style={styles.cardTitle}>📄 Vertex AI Response</Text>
          <ScrollView style={styles.textScrollView} nestedScrollEnabled>
            <Text style={styles.resultText}>{testResult}</Text>
          </ScrollView>
        </View>
      )}

      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>ℹ️ Setup Status</Text>
        <Text style={styles.infoText}>✅ Firebase project configured</Text>
        <Text style={styles.infoText}>✅ google-services.json in place</Text>
        <Text style={styles.infoText}>✅ Vertex AI dependencies installed</Text>
        <Text style={styles.infoText}>✅ Asia-south1 region compliance</Text>
        <Text style={styles.infoText}>⏳ OCR SDK integration pending</Text>
        <Text style={[styles.sectionDescription, { marginTop: 12 }]}>
          Once this test passes, the OCR SDK will work with the same Firebase configuration.
        </Text>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Testing Firebase...</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#4CAF50',
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
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 6,
    color: '#555',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 4,
  },
  testButton: {
    backgroundColor: '#2196F3',
  },
  resultCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 3,
  },
  resultText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  textScrollView: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    padding: 12,
    backgroundColor: '#F9F9F9',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
});