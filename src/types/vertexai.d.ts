// Type declarations for Firebase Vertex AI

export interface GenerativeModel {
  generateContent(content: Array<{
    text?: string;
    inlineData?: {
      mimeType: string;
      data: string;
    };
  }>): Promise<{
    response: {
      text(): string;
    };
  }>;
}

export interface VertexAI {
  getGenerativeModel(config: {
    model: string;
    generationConfig?: {
      temperature?: number;
      maxOutputTokens?: number;
      responseMimeType?: string;
    };
  }): GenerativeModel;
}

// Extend Firebase App with Vertex AI
declare module '@react-native-firebase/app' {
  interface FirebaseApp {
    vertexAI(config?: { location: string }): VertexAI;
  }
}

export {};
