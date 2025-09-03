import { FirebaseAIService } from './FirebaseAIService';
import { ChequeOCRData, ENachOCRData, ChequeOCRResult, ENachOCRResult, OCRProcessingOptions } from '../types';
import { FirebaseApp } from '@react-native-firebase/app';

export class DocumentProcessorService {
  private static readonly TAG = 'DocumentProcessorService';
  private firebaseService: FirebaseAIService;

  constructor() {
    this.firebaseService = new FirebaseAIService();
  }

  async initialize(app: FirebaseApp): Promise<void> {
    try {
      console.log(`${DocumentProcessorService.TAG}: Initializing document processor`);
      await this.firebaseService.initializeService(app);
      console.log(`${DocumentProcessorService.TAG}: ✅ Document processor initialized`);
    } catch (error) {
      console.error(`${DocumentProcessorService.TAG}: Initialization failed`, error);
      throw error;
    }
  }

  isInitialized(): boolean {
    return this.firebaseService.isServiceInitialized();
  }

  validateRegionalCompliance(): boolean {
    return this.firebaseService.validateRegionalCompliance();
  }

  async processCheque(
    imageUri: string, 
    customPrompt?: string,
    options?: OCRProcessingOptions
  ): Promise<ChequeOCRResult> {
    try {
      console.log(`${DocumentProcessorService.TAG}: Processing cheque document`);
      
      if (!this.isInitialized()) {
        throw new Error('Document processor not initialized');
      }

      const startTime = Date.now();
      const chequeData = await this.firebaseService.processCheque(imageUri, options);
      const processingTime = Date.now() - startTime;

      console.log(`${DocumentProcessorService.TAG}: Cheque processed in ${processingTime}ms`);

      // Perform validation if enabled
      const validationErrors: string[] = [];
      if (options?.enableValidation !== false) {
        validationErrors.push(...this.validateChequeData(chequeData));
      }

      // Perform cross-validation if enabled
      if (options?.enableFraudDetection !== false) {
        const fraudIndicators = this.performFraudDetection(chequeData);
        chequeData.fraudIndicators = [...chequeData.fraudIndicators, ...fraudIndicators];
      }

      return {
        success: true,
        data: chequeData,
        validationErrors: validationErrors.length > 0 ? validationErrors : undefined,
      };

    } catch (error) {
      console.error(`${DocumentProcessorService.TAG}: Cheque processing failed`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async processENach(
    imageUri: string,
    customPrompt?: string, 
    options?: OCRProcessingOptions
  ): Promise<ENachOCRResult> {
    try {
      console.log(`${DocumentProcessorService.TAG}: Processing e-NACH document`);
      
      if (!this.isInitialized()) {
        throw new Error('Document processor not initialized');
      }

      const startTime = Date.now();
      const enachData = await this.firebaseService.processENach(imageUri, options);
      const processingTime = Date.now() - startTime;

      console.log(`${DocumentProcessorService.TAG}: e-NACH processed in ${processingTime}ms`);

      // Perform validation if enabled
      const validationErrors: string[] = [];
      if (options?.enableValidation !== false) {
        validationErrors.push(...this.validateENachData(enachData));
      }

      return {
        success: true,
        data: enachData,
        validationErrors: validationErrors.length > 0 ? validationErrors : undefined,
      };

    } catch (error) {
      console.error(`${DocumentProcessorService.TAG}: e-NACH processing failed`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private validateChequeData(data: ChequeOCRData): string[] {
    const errors: string[] = [];

    // Basic validation rules
    if (!data.bankName || data.bankName.trim() === '') {
      errors.push('Bank name is required');
    }

    if (!data.accountNumber || data.accountNumber.trim() === '') {
      errors.push('Account number is required');
    }

    if (!data.ifscCode || data.ifscCode.trim() === '') {
      errors.push('IFSC code is required');
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(data.ifscCode)) {
      errors.push('Invalid IFSC code format');
    }

    if (!data.chequeNumber || data.chequeNumber.trim() === '') {
      errors.push('Cheque number is required');
    }

    if (!data.date || data.date.trim() === '') {
      errors.push('Date is required');
    } else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(data.date)) {
      errors.push('Invalid date format (expected DD/MM/YYYY)');
    }

    // MICR code validation
    if (data.micrCode && !/^\d{9}$/.test(data.micrCode.replace(/\D/g, ''))) {
      errors.push('Invalid MICR code format');
    }

    return errors;
  }

  private validateENachData(data: ENachOCRData): string[] {
    const errors: string[] = [];

    // Basic validation rules
    if (!data.bankName || data.bankName.trim() === '') {
      errors.push('Bank name is required');
    }

    if (!data.accountNumber || data.accountNumber.trim() === '') {
      errors.push('Account number is required');
    }

    if (!data.accountHolderName || data.accountHolderName.trim() === '') {
      errors.push('Account holder name is required');
    }

    if (!data.ifscCode || data.ifscCode.trim() === '') {
      errors.push('IFSC code is required');
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(data.ifscCode)) {
      errors.push('Invalid IFSC code format');
    }

    if (!data.maxAmount || data.maxAmount.trim() === '') {
      errors.push('Maximum amount is required');
    }

    if (!data.frequency || data.frequency.trim() === '') {
      errors.push('Frequency is required');
    }

    // Date validations
    if (data.startDate && !/^\d{2}\/\d{2}\/\d{4}$/.test(data.startDate)) {
      errors.push('Invalid start date format (expected DD/MM/YYYY)');
    }

    if (data.endDate && !/^\d{2}\/\d{2}\/\d{4}$/.test(data.endDate)) {
      errors.push('Invalid end date format (expected DD/MM/YYYY)');
    }

    if (data.dateOfMandate && !/^\d{2}\/\d{2}\/\d{4}$/.test(data.dateOfMandate)) {
      errors.push('Invalid mandate date format (expected DD/MM/YYYY)');
    }

    return errors;
  }

  private performFraudDetection(data: ChequeOCRData): string[] {
    const fraudIndicators: string[] = [];

    // Basic fraud detection rules
    if (!data.signaturePresent) {
      fraudIndicators.push('No signature detected');
    }

    if (data.documentQuality && data.documentQuality.toLowerCase().includes('poor')) {
      fraudIndicators.push('Poor document quality detected');
    }

    // Check for suspicious amounts
    if (data.amountInNumbers && data.amountInWords) {
      const numericAmount = data.amountInNumbers.replace(/[^\d.]/g, '');
      if (parseFloat(numericAmount) > 100000) {
        fraudIndicators.push('High amount transaction');
      }
    }

    // Check for missing critical fields
    const criticalFields = [
      data.bankName,
      data.accountNumber, 
      data.ifscCode,
      data.accountHolderName,
      data.date
    ];

    const missingFields = criticalFields.filter(field => !field || field.trim() === '');
    if (missingFields.length > 2) {
      fraudIndicators.push('Multiple critical fields missing');
    }

    return fraudIndicators;
  }
}