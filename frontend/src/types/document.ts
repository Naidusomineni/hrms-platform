export type DocumentCategory =
  | 'GOVERNMENT_ID'
  | 'ACADEMIC'
  | 'EXPERIENCE'
  | 'TAX'
  | 'HR_LETTER'
  | 'POLICY'
  | string;

export type DocumentStatus =
  | 'PENDING'
  | 'VERIFIED'
  | 'REJECTED'
  | 'EXPIRED'
  | string;

export interface DocumentResponse {
  id: number;
  employeeId: number;
  employeeName?: string;
  category: DocumentCategory;
  title: string;
  documentNumber?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  downloadUrl?: string;
  issueDate?: string;
  expiryDate?: string;
  status: DocumentStatus;
  verifiedByName?: string;
  verifiedAt?: string;
  verificationRemarks?: string;
  createdAt?: string;
}

export interface HrLetterRequest {
  employeeId: number;
  letterType: string;
  purpose: string;
  addressedTo?: string;
}
