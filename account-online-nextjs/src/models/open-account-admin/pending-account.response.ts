// Pagination Response Wrapper
export interface PaginationResponse<T> {
  content: T[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// Pending Account Opening Request DTO
export interface PendingAccountOpeningRequestDto {
  // Request metadata
  id: string;
  legalId: string;
  status: string;
  createdAt: string;
  message?: string;
  remark?: string;
  amlStatus?: string;

  // Raw JSON data (backup)
  amlResultData?: any;
  requestData?: any;
  customerInfo?: any;

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
  customerType?: string;

  // Current address
  customerProvinceCode?: string;
  customerProvince?: string;
  customerDistrictCode?: string;
  customerDistrict?: string;
  customerCommuneCode?: string;
  customerCommune?: string;
  customerVillageCode?: string;
  customerVillage?: string;

  // Place of birth
  customerPobProvinceCode?: string;
  customerPobProvince?: string;
  customerPobDistrictCode?: string;
  customerPobDistrict?: string;
  customerPobCommuneCode?: string;
  customerPobCommune?: string;
  customerPobVillageCode?: string;
  customerPobVillage?: string;

  // Branch info
  branchCode?: string;
  branchNameKh?: string;

  // Banking info
  productAccount?: string;
  categoryAccount?: string;
  customerRole?: string;
  loanOfficer?: string;
  releasedBy?: string;

  // Images
  nidImageName?: string;
  selfieImageName?: string;

  // AML details
  amlRiskLevel?: string;
  amlActionTaken?: string;
  amlTotalRulesScore?: number;
  amlTrxnId?: string;
  serviceName?: string;
  amlRulesTriggered?: string;
}

// Main DTO for Pending Account Review
export interface PendingAccountAdminReviewDto {
  // Request metadata
  requestId: string;
  legalId: string;
  status: string;
  createdAt: string;
  amlStatus?: string;
  remark?: string;

  // Raw JSON data (backup)
  amlResultData?: any;
  requestData?: any;
  customerInfo?: any;

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
  customerType?: string;

  // Current address
  customerProvinceCode?: string;
  customerProvince?: string;
  customerDistrictCode?: string;
  customerDistrict?: string;
  customerCommuneCode?: string;
  customerCommune?: string;
  customerVillageCode?: string;
  customerVillage?: string;

  // Place of birth
  customerPobProvinceCode?: string;
  customerPobProvince?: string;
  customerPobDistrictCode?: string;
  customerPobDistrict?: string;
  customerPobCommuneCode?: string;
  customerPobCommune?: string;
  customerPobVillageCode?: string;
  customerPobVillage?: string;

  // Branch info
  branchCode?: string;
  branchNameKh?: string;

  // Banking info
  productAccount?: string;
  categoryAccount?: string;
  customerRole?: string;
  loanOfficer?: string;
  releasedBy?: string;

  // Images
  nidImageName?: string;
  selfieImageName?: string;

  // AML details
  amlRiskLevel?: string;
  amlActionTaken?: string;
  amlTotalRulesScore?: number;
  amlTrxnId?: string;
  serviceName?: string;
  amlRulesTriggered?: string;
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
