export interface ChequeOCRData {
  bankName: string;
  branchAddress: string;
  ifscCode: string;
  accountHolderName: string;
  accountNumber: string;
  chequeNumber: string;
  micrCode: string;
  date: string;
  amountInWords: string;
  amountInNumbers: string;
  payToName: string;
  signaturePresent: boolean;
  documentQuality: string;
  documentType: string;
  authorizationPresent: boolean;
  fraudIndicators: string[];
  confidence: number;
  processingTime: number;
}

export interface ChequeOCRResult {
  success: boolean;
  data?: ChequeOCRData;
  error?: string;
  validationErrors?: string[];
}