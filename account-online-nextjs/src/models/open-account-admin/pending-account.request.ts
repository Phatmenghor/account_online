// Request for fetching all pending accounts
export interface GetAllPendingAccountsRequest {
  pageNo: number;
  pageSize: number;
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

// Request for fetching single pending account by ID
export interface GetPendingAccountByIdRequest {
  id: string;
}

// Request for approving pending account
export interface ApprovePendingAccountRequest {
  id: string;
  remark?: string;
}

// Request for rejecting pending account
export interface RejectPendingAccountRequest {
  id: string;
  remark: string;
}
