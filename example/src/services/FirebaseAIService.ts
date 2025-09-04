/**
 * Firebase AI Service for OCR SDK
 * Uses the new @react-native-firebase/ai package instead of deprecated vertex AI
 */

import { getAI, getGenerativeModel } from '@react-native-firebase/ai';

export interface OCRResult {
  success: boolean;
  documentType: string;
  extractedFields: Record<string, any>;
  confidence: number;
  rawResponse?: string;
  error?: string;
}

export class FirebaseAIService {
  private static instance: FirebaseAIService;
  private generativeModel: any = null;

  private constructor() {}

  public static getInstance(): FirebaseAIService {
    if (!FirebaseAIService.instance) {
      FirebaseAIService.instance = new FirebaseAIService();
    }
    return FirebaseAIService.instance;
  }

  public async initialize(): Promise<void> {
    try {
      // Initialize the generative model using the new Firebase AI SDK
      const ai = getAI();
      this.generativeModel = getGenerativeModel(ai, {
        model: 'gemini-1.5-flash'
      });
      
      console.log('Firebase AI service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Firebase AI service:', error);
      throw error;
    }
  }

  public async processDocumentText(extractedText: string, documentType: 'cheque' | 'enach' | 'auto'): Promise<OCRResult> {
    try {
      if (!this.generativeModel) {
        await this.initialize();
      }

      const prompt = this.generatePrompt(extractedText, documentType);
      
      const result = await this.generativeModel.generateContent(prompt);
      const responseText = result.response.text();

      // Try to parse the JSON response
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(responseText);
      } catch (parseError) {
        console.warn('Failed to parse AI response as JSON, returning raw text');
        parsedResponse = { raw_response: responseText };
      }

      return {
        success: true,
        documentType: parsedResponse.document_type || documentType,
        extractedFields: parsedResponse.extracted_fields || parsedResponse,
        confidence: parsedResponse.confidence || parsedResponse.confidence_score || 0.8,
        rawResponse: responseText
      };

    } catch (error) {
      console.error('Firebase AI processing failed:', error);
      return {
        success: false,
        documentType,
        extractedFields: {},
        confidence: 0,
        error: error instanceof Error ? error.message : 'Unknown AI processing error'
      };
    }
  }

  private generatePrompt(extractedText: string, documentType: 'cheque' | 'enach' | 'auto'): string {
    switch (documentType) {
      case 'cheque':
        return this.generateChequePrompt(extractedText);
      case 'enach':
        return this.generateENachPrompt(extractedText);
      case 'auto':
      default:
        return this.generateAutoDetectionPrompt(extractedText);
    }
  }

  private generateChequePrompt(extractedText: string): string {
    return `Extract the following fields from this Indian bank cheque text in JSON format:

Text: ${extractedText}

Required fields:
{
  "payee_name": "name of the person/entity to pay",
  "amount_words": "amount written in words", 
  "amount_numbers": "amount in numbers",
  "date": "cheque date",
  "bank_name": "bank name",
  "account_number": "account number if visible",
  "cheque_number": "cheque number",
  "ifsc_code": "IFSC code if visible",
  "micr_code": "MICR code if visible", 
  "signature_present": "true/false",
  "confidence_score": "overall confidence 0-1"
}

Return only valid JSON. If a field is not found, use null.`;
  }

  private generateENachPrompt(extractedText: string): string {
    return `Extract the following fields from this Indian e-NACH mandate form text in JSON format:

Text: ${extractedText}

Required fields:
{
  "customer_name": "customer name",
  "account_number": "bank account number",
  "bank_name": "bank name", 
  "ifsc_code": "IFSC code",
  "mandate_type": "maximum/fixed amount",
  "amount": "mandate amount",
  "start_date": "mandate start date",
  "end_date": "mandate end date",
  "frequency": "frequency (monthly/quarterly etc)",
  "corporate_name": "corporate/utility name",
  "signature_present": "true/false",
  "confidence_score": "overall confidence 0-1"
}

Return only valid JSON. If a field is not found, use null.`;
  }

  private generateAutoDetectionPrompt(extractedText: string): string {
    return `Analyze this Indian banking document text and:
1. Identify if it's a bank cheque or e-NACH mandate form
2. Extract relevant fields based on document type

Text: ${extractedText}

Return JSON format:
{
  "document_type": "cheque" or "enach" or "unknown",
  "confidence": "detection confidence 0-1", 
  "extracted_fields": { /* fields based on document type */ },
  "notes": "any additional observations"
}

For cheques extract: payee_name, amount_words, amount_numbers, date, bank_name, account_number, cheque_number
For e-NACH extract: customer_name, account_number, bank_name, ifsc_code, amount, start_date, end_date

Return only valid JSON.`;
  }
}

export default FirebaseAIService;
