// Firebase Configuration for JustdialOCR SDK
// Uses Firebase AI Logic with Vertex AI backend for India region compliance
// Matches Android implementation: Firebase.ai(backend = GenerativeBackend.vertexAI())

import { initializeApp } from 'firebase/app';

// Firebase configuration with API key
const firebaseConfig = {
  apiKey: "AIzaSyCWjLoB6lyRGWwWG5DWfc0kfwp-CpoS3JQ",
  authDomain: "ambient-stack-467317-n7.firebaseapp.com",
  projectId: "ambient-stack-467317-n7",
  storageBucket: "ambient-stack-467317-n7.firebasestorage.app",
  messagingSenderId: "134377649404",
  appId: "1:134377649404:web:19aa9279f093418ca15379",
  measurementId: "G-HX7Z94CYXV"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase AI Logic with Vertex AI backend (matching Android implementation)
let aiService: any = null;
const REGION = 'asia-south1'; // India region for data residency compliance

console.log('Firebase Config: Initializing Firebase AI Logic for India compliance');
console.log(`Firebase Config: Target region: ${REGION} for India data residency compliance`);

try {
  // Use correct VertexAI backend initialization (matching the guidance)
  const { getAI, VertexAIBackend } = require('firebase/vertexai');
  
  aiService = getAI(firebaseApp, { 
    backend: new VertexAIBackend({ location: REGION }) 
  });
  
  console.log('Firebase Config: ✅ TRUE Firebase AI Logic initialized with India region compliance');
  console.log(`Firebase Config: Using Vertex AI backend with region: ${REGION}`);
  
} catch (error) {
  console.error('Firebase Config: Failed to initialize Firebase AI Logic with Vertex AI backend:', error);
  throw error;
}

export { firebaseApp, firebaseConfig, REGION };
export { aiService as vertexAI };
