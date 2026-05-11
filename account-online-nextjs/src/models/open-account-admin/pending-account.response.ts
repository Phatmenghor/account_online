// Pagination Response Wrapper
export interface PaginationResponse<T> {
  content: T[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// Customer Address Information
export interface AddressInfo {
  province: string;
  district: string;
  commune: string;
  village: string;
}

// Legal Document Information
export interface LegalDocInfo {
  type: string;
  issueDate: string;
  expirationDate: string;
  holderName: string;
  mrz1?: string;
  mrz2?: string;
  mrz3?: string;
}

// Business/Employment Information
export interface BusinessInfo {
  companyName: string;
  occupation: string;
  industry: string;
  sector: string;
  monthlyIncome: string;
}

// AML Result Information
export interface AmlResult {
  status: string;
  riskLevel: string;
  screeningResult: string;
  rulesTriggered: string;
  totalRulesScore: number;
  actionTaken: string;
  serviceName: string;
}

// Image File Information
export interface ImageInfo {
  nidImageName?: string;
  nidImageUrl?: string;
  selfieImageName?: string;
  selfieImageUrl?: string;
}

// Main DTO for Pending Account Review
export interface PendingAccountAdminReviewDto {
  // Metadata
  id: string;
  requestId: string;
  status: string;
  createdAt: string;
  updatedAt: string;

  // Personal Information
  legalId: string;
  givenName: string;
  familyName: string;
  firstNameKh: string;
  lastNameKh: string;
  gender: string;
  dateOfBirth: string;
  nationality: string;
  maritalStatus: string;
  phoneNumber: string;
  email: string;

  // Current Address
  currentAddress: AddressInfo;

  // Place of Birth
  placeOfBirth: AddressInfo;

  // Legal Document
  legalDocument: LegalDocInfo;

  // Business/Employment
  businessInfo: BusinessInfo;

  // Images
  images: ImageInfo;

  // AML Information
  amlInfo: AmlResult;

  // Additional Fields
  referralId?: string;
  branchCode?: string;
  legalAddress?: string;
}

// Request for approving account
export interface ApprovePendingAccountRequest {
  id: string;
  remark?: string;
}

// Request for rejecting account
export interface RejectPendingAccountRequest {
  id: string;
  remark: string;
}

// Response from approve/reject operations
export interface PendingAccountActionResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    status: string;
    updatedAt: string;
  };
}

// Request History Record (Audit Trail)
export interface RequestHistoryRecord {
  id: string;
  requestId: string;
  legalId: string;
  status: string;
  actionUsername: string;
  remark?: string;
  createdAt: number;
}

// Review History Response - Audit Trail
export interface ReviewHistoryResponseDto {
  requestId: string;
  legalId: string;
  history: RequestHistoryRecord[];
}
