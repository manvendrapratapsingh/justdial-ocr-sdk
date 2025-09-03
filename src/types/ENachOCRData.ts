export interface ENachOCRData {
  utilityName: string;
  utilityCode: string;
  customerRefNumber: string;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountType: string;
  maxAmount: string;
  frequency: string;
  startDate: string;
  endDate: string;
  primaryAccountRef: string;
  sponsorBankName: string;
  umrn: string;
  mandateType: string;
  authMode: string;
  customerSignature: boolean;
  dateOfMandate: string;
  confidence: number;
  processingTime: number;
}

export interface ENachOCRResult {
  success: boolean;
  data?: ENachOCRData;
  error?: string;
  validationErrors?: string[];
}