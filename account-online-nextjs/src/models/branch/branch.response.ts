export interface AllBranchModel {
  content: BranchModel[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  totalCount: number;
}

export interface BranchModel {
  branchID: string;
  branchkh: string;
}
