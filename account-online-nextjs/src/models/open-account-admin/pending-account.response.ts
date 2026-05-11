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

  // AML information
  amlStatus: string;
  amlResultData?: string;

  // Complete customer data (raw JSON)
  requestData?: string;

  // Customer info JSON
  customerInfo?: string;
}

// Main DTO for Pending Account Review
export interface PendingAccountAdminReviewDto {
  // Request metadata
  requestId: string;
  legalId: string;
  status: string;
  createdAt: string;

  // AML information
  amlStatus: string;
  amlResultData?: string;

  // Review remarks
  remark?: string;

  // Complete customer data (raw JSON)
  requestData?: string;

  // Customer info JSON
  customerInfo?: string;
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
