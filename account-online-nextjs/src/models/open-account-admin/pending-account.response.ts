// Pagination Response Wrapper
export interface PaginationResponse<T> {
  content: T[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// Customer AML Info (nested inside amlResultData)
export interface CustomerAmlInfo {
  legalId?: string;
  familyName?: string;
  givenName?: string;
  firstNameKh?: string;
  lastNameKh?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  legalAddress?: string;
  phoneNumber?: string;
  issuedDate?: string;
  expiredDate?: string;
}

// User Info (for approvedBy/rejectedBy)
export interface UserInfo {
  id?: string;
  username?: string;
  email?: string;
  fullName?: string;
}

// AML Result for Pending Account (clean AML screening data only)
export interface AmlResultForPendingAccountDto {
  id?: string;
  customerInfo?: CustomerAmlInfo;
  status?: string; // AML status (APPROVE, PENDING, REJECT)
  screeningResult?: string;
  riskLevel?: string;
  actionTaken?: string;
  rulesTriggered?: string;
  serviceName?: string;
  totalRulesScore?: number;
  trxnID?: string;
  approvedBy?: UserInfo;
  rejectedBy?: UserInfo;
  createdAt?: string;
  updatedAt?: string;
  nidImageName?: string;
  selfieImageName?: string;
}

// Pending Account Opening Request DTO
export interface PendingAccountOpeningRequestDto {
  // Request metadata
  id: string;
  legalId: string;
  status: string;
  createdAt: string;
  remark?: string;
  amlStatus?: string;

  // AML result data (clean AML screening data only)
  amlResultData?: AmlResultForPendingAccountDto;

  // Legal/NID info
  legalDocName?: string;
  legalHolderName?: string;
  legalFirstNameEn?: string;
  legalLastNameEn?: string;
  legalFirstNameKh?: string;
  legalLastNameKh?: string;
  legalDateOfBirth?: string;
  legalGender?: string;
  legalAddress?: string;
  legalPlaceOfBirth?: string;
  legalIssuedDate?: string;
  legalExpiredDate?: string;
  legalMRZ1?: string;
  legalMRZ2?: string;
  legalMRZ3?: string;

  // Customer info
  title?: string;
  maritalStatus?: string;
  nationality?: string;
  companyName?: string;
  occupation?: string;
  industry?: string;
  sector?: string;
  averageIncome?: string;
  phoneNumber?: string;
  email?: string;

  // Current address
  customerProvince?: string;
  customerDistrict?: string;
  customerCommune?: string;
  customerVillage?: string;

  // Place of birth
  customerPobProvince?: string;
  customerPobDistrict?: string;
  customerPobCommune?: string;
  customerPobVillage?: string;

  // Branch info
  branchCode?: string;

  // Banking info
  productAccount?: string;
  categoryAccount?: string;
  customerRole?: string;
  loanOfficer?: string;
  releasedBy?: string;

  // Images
  nidImageName?: string;
  selfieImageName?: string;
}

// Main DTO for Pending Account Review
export interface PendingAccountAdminReviewDto {
  // Request metadata
  requestId: string;
  legalId: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  amlStatus?: string;
  remark?: string;

  // AML result data (clean AML screening data only)
  amlResultData?: AmlResultForPendingAccountDto;

  // Legal/NID info
  legalDocName?: string;
  legalHolderName?: string;
  legalFirstNameEn?: string;
  legalLastNameEn?: string;
  legalFirstNameKh?: string;
  legalLastNameKh?: string;
  legalDateOfBirth?: string;
  legalGender?: string;
  legalAddress?: string;
  legalPlaceOfBirth?: string;
  legalIssuedDate?: string;
  legalExpiredDate?: string;
  legalMRZ1?: string;
  legalMRZ2?: string;
  legalMRZ3?: string;

  // Customer info
  title?: string;
  maritalStatus?: string;
  nationality?: string;
  companyName?: string;
  occupation?: string;
  industry?: string;
  sector?: string;
  averageIncome?: string;
  phoneNumber?: string;
  email?: string;

  // Current address
  customerProvince?: string;
  customerDistrict?: string;
  customerCommune?: string;
  customerVillage?: string;

  // Place of birth
  customerPobProvince?: string;
  customerPobDistrict?: string;
  customerPobCommune?: string;
  customerPobVillage?: string;

  // Branch info
  branchCode?: string;

  // Banking info
  productAccount?: string;
  categoryAccount?: string;
  customerRole?: string;
  loanOfficer?: string;
  releasedBy?: string;

  // Images
  nidImageName?: string;
  selfieImageName?: string;
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
  createdAt: string;
}

// Review History Response - Audit Trail
export interface ReviewHistoryResponseDto {
  requestId: string;
  legalId: string;
  history: RequestHistoryRecord[];
}
