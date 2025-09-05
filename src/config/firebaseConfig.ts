// Firebase Configuration for JustdialOCR SDK
// Uses standard Firebase SDK for AI functionality with proper API keys

import { initializeApp } from 'firebase/app';
import { getVertexAI } from 'firebase/vertexai';

// Firebase configuration with API key
const firebaseConfig = {
  apiKey: "AIzaSyDtf0WDyfgiM-zo7SLJhG4IBYAI4h3UW_8",
  authDomain: "justdial-ocr-sdk.firebaseapp.com",
  projectId: "justdial-ocr-sdk",
  storageBucket: "justdial-ocr-sdk.firebasestorage.app",
  messagingSenderId: "1061320330355",
  appId: "1:1061320330355:web:e9c56191cb8f1cdd5cae06"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Vertex AI with asia-south1 region for compliance
const vertexAI = getVertexAI(firebaseApp, {
  location: 'asia-south1' // Mumbai, India region for data compliance
});

export { firebaseApp, vertexAI, firebaseConfig };