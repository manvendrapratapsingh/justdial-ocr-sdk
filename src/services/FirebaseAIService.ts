// Firebase AI Logic Service - NO AUTHENTICATION REQUIRED
// Uses Firebase project credentials from google-services.json / GoogleService-Info.plist
// Direct replacement for Gemini Developer API with Vertex AI backend
import firebaseApp from '@react-native-firebase/app';
import type { VertexAI } from '../types/vertexai';
import type { OCRConfiguration, ChequeOCRData, ENachOCRData, OCRProcessingOptions } from '../types';

type FirebaseApp = typeof firebaseApp;
import { ImageUtils } from '../utils/ImageUtils';

export class FirebaseAIService {
  private static readonly TAG = 'FirebaseAIService';
  private static readonly REGION = 'asia-south1'; // REQUIRED: India region for compliance
  private static readonly MODEL_NAME = 'gemini-1.5-flash-001'; // Latest stable model
  
  private vertexAI: VertexAI | null = null;
  private isInitialized = false;
  
  private readonly defaultConfig: OCRConfiguration = {
    region: 'asia-south1',
    temperature: 0.1, // Match Android implementation
    maxOutputTokens: 4096, // Match Android implementation  
    responseMimeType: 'application/json',
    maxImageDimension: 1024, // Optimized dimension
    enableFraudDetection: true,
    enableCrossValidation: true,
  };

  async initializeService(app: FirebaseApp): Promise<void> {
    try {
      console.log(`${FirebaseAIService.TAG}: Initializing Firebase AI Logic (No Auth Required)`);
      
      // Initialize Vertex AI with asia-south1 region for compliance
      // This uses the Firebase project configuration automatically
      this.vertexAI = (app as any).vertexAI({
        location: FirebaseAIService.REGION, // asia-south1 enforced
      });
      
      // Validate regional compliance
      if (!this.validateRegionalCompliance()) {
        throw new Error('Regional compliance validation failed - must use asia-south1');
      }
      
      this.isInitialized = true;
      console.log(`${FirebaseAIService.TAG}: ✅ Firebase AI Logic initialized successfully`);
      console.log(`${FirebaseAIService.TAG}: Region: ${FirebaseAIService.REGION} (Mumbai, India)`);
      console.log(`${FirebaseAIService.TAG}: Model: ${FirebaseAIService.MODEL_NAME}`);
      console.log(`${FirebaseAIService.TAG}: Authentication: Not required (uses project credentials)`);
    } catch (error) {
      console.error(`${FirebaseAIService.TAG}: Firebase AI initialization failed`, error);
      throw error;
    }
  }

  isServiceInitialized(): boolean {
    return this.isInitialized;
  }

  validateRegionalCompliance(): boolean {
    return this.defaultConfig.region === 'asia-south1';
  }

  async processCheque(imageUri: string, _options?: OCRProcessingOptions): Promise<ChequeOCRData> {
    if (!this.isInitialized || !this.vertexAI) {
      throw new Error('Firebase AI Service not initialized');
    }

    const startTime = Date.now();
    
    try {
      console.log(`${FirebaseAIService.TAG}: Starting cheque processing`);
      
      // Optimize image for processing
      const optimizedImage = await ImageUtils.optimizeImageForProcessing(
        imageUri, 
        this.defaultConfig.maxImageDimension
      );
      
      const prompt = this.getChequePrompt();
      const result = await this.generateContent(prompt, optimizedImage);
      
      const processingTime = Date.now() - startTime;
      const chequeData = this.parseChequeResponse(result);
      
      return {
        ...chequeData,
        processingTime,
        confidence: this.calculateConfidence(result),
      };
    } catch (error) {
      console.error(`${FirebaseAIService.TAG}: Cheque processing failed`, error);
      throw error;
    }
  }

  async processENach(imageUri: string, _options?: OCRProcessingOptions): Promise<ENachOCRData> {
    if (!this.isInitialized || !this.vertexAI) {
      throw new Error('Firebase AI Service not initialized');
    }

    const startTime = Date.now();
    
    try {
      console.log(`${FirebaseAIService.TAG}: Starting e-NACH processing`);
      
      // Optimize image for processing
      const optimizedImage = await ImageUtils.optimizeImageForProcessing(
        imageUri, 
        this.defaultConfig.maxImageDimension
      );
      
      const prompt = this.getENachPrompt();
      const result = await this.generateContent(prompt, optimizedImage);
      
      const processingTime = Date.now() - startTime;
      const enachData = this.parseENachResponse(result);
      
      return {
        ...enachData,
        processingTime,
        confidence: this.calculateConfidence(result),
      };
    } catch (error) {
      console.error(`${FirebaseAIService.TAG}: e-NACH processing failed`, error);
      throw error;
    }
  }

  private async generateContent(prompt: string, imageBase64: string): Promise<string> {
    if (!this.vertexAI) {
      throw new Error('VertexAI not initialized');
    }

    const model = this.vertexAI.getGenerativeModel({
      model: FirebaseAIService.MODEL_NAME,
      generationConfig: {
        temperature: this.defaultConfig.temperature,
        maxOutputTokens: this.defaultConfig.maxOutputTokens,
        responseMimeType: this.defaultConfig.responseMimeType,
      },
    });

    const response = await model.generateContent([
      {
        text: prompt,
      },
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64,
        },
      },
    ]);

    return response.response.text();
  }

  private getChequePrompt(): string {
    // Match Android implementation prompt structure
    return `Extract cheque details from this Indian bank cheque image.
Return JSON with exact keys:
{
  "bank_name": "string",
  "branchAddress": "string",
  "ifsc_code": "string", 
  "account_holder_name": "string",
  "account_number": "string",
  "chequeNumber": "string",
  "micr_code": "string",
  "date": "DD/MM/YYYY",
  "amountInWords": "string",
  "amountInNumbers": "string",
  "payToName": "string", 
  "signature_present": "boolean",
  "document_quality": "string",
  "document_type": "string",
  "authorizationPresent": "boolean",
  "fraud_indicators": ["array of potential fraud indicators"]
}`;
  }

  private getENachPrompt(): string {
    // Match Android e-NACH prompt structure
    return `Extract e-NACH mandate details from this Indian e-NACH form.
Return JSON with exact keys:
{
  "utilityName": "string",
  "utilityCode": "string",
  "customerRefNumber": "string",
  "accountHolderName": "string",
  "bankName": "string",
  "accountNumber": "string",
  "ifscCode": "string",
  "accountType": "string",
  "maxAmount": "string",
  "frequency": "string",
  "startDate": "DD/MM/YYYY",
  "endDate": "DD/MM/YYYY",
  "primaryAccountRef": "string",
  "sponsorBankName": "string",
  "umrn": "string",
  "mandateType": "string",
  "authMode": "string",
  "customerSignature": "boolean",
  "dateOfMandate": "DD/MM/YYYY"
}`;
  }

  private parseChequeResponse(response: string): Omit<ChequeOCRData, 'confidence' | 'processingTime'> {
    try {
      const cleanJson = this.extractJsonFromResponse(response);
      const data = JSON.parse(cleanJson);
      
      // Parse fraud indicators array if present
      const fraudIndicatorsArray = data.fraud_indicators;
      const fraudIndicatorsList: string[] = [];
      if (Array.isArray(fraudIndicatorsArray)) {
        fraudIndicatorsList.push(...fraudIndicatorsArray.filter((item: any) => 
          typeof item === 'string' && item.trim() !== ''
        ));
      }

      return {
        bankName: data.bank_name || '',
        branchAddress: data.branchAddress || '',
        ifscCode: data.ifsc_code || '',
        accountHolderName: data.account_holder_name || '',
        accountNumber: data.account_number || '',
        chequeNumber: data.chequeNumber || '',
        micrCode: data.micr_code || '',
        date: data.date || '',
        amountInWords: data.amountInWords || '',
        amountInNumbers: data.amountInNumbers || '',
        payToName: data.payToName || '',
        signaturePresent: data.signature_present === 'true' || data.signature_present === true,
        documentQuality: data.document_quality || '',
        documentType: data.document_type || '',
        authorizationPresent: data.authorizationPresent === 'true' || data.authorizationPresent === true,
        fraudIndicators: fraudIndicatorsList,
      };
    } catch (error) {
      throw new Error('Failed to parse cheque response');
    }
  }

  private parseENachResponse(response: string): Omit<ENachOCRData, 'confidence' | 'processingTime'> {
    try {
      const cleanJson = this.extractJsonFromResponse(response);
      const data = JSON.parse(cleanJson);
      
      return {
        utilityName: data.utilityName || '',
        utilityCode: data.utilityCode || '',
        customerRefNumber: data.customerRefNumber || '',
        accountHolderName: data.accountHolderName || '',
        bankName: data.bankName || '',
        accountNumber: data.accountNumber || '',
        ifscCode: data.ifscCode || '',
        accountType: data.accountType || '',
        maxAmount: data.maxAmount || '',
        frequency: data.frequency || '',
        startDate: data.startDate || '',
        endDate: data.endDate || '',
        primaryAccountRef: data.primaryAccountRef || '',
        sponsorBankName: data.sponsorBankName || '',
        umrn: data.umrn || '',
        mandateType: data.mandateType || '',
        authMode: data.authMode || '',
        customerSignature: data.customerSignature === 'true' || data.customerSignature === true,
        dateOfMandate: data.dateOfMandate || '',
      };
    } catch (error) {
      throw new Error('Failed to parse e-NACH response');
    }
  }

  private extractJsonFromResponse(response: string): string {
    const jsonStart = response.indexOf('{');
    const jsonEnd = response.lastIndexOf('}');
    return (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) 
      ? response.substring(jsonStart, jsonEnd + 1) 
      : '{}';
  }

  private calculateConfidence(response: string): number {
    // Basic confidence calculation based on response completeness
    try {
      const cleanJson = this.extractJsonFromResponse(response);
      const data = JSON.parse(cleanJson);
      const fields = Object.values(data).filter(value => 
        value && value !== '' && (!Array.isArray(value) || value.length > 0)
      );
      const totalFields = Object.keys(data).length;
      return Math.round((fields.length / totalFields) * 100);
    } catch {
      return 50; // Default confidence
    }
  }
}