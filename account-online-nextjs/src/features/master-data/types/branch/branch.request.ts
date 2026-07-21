export interface CreateBranchReq {
  branchCode: string;
  branchKh: string;
}

export interface UpdateBranchReq {
  branchCode?: string;
  branchKh?: string;
}

export interface AllBranchReq {
  pageNo: number;
  pageSize: number;
  search?: string;
  status?: string;
}
