export interface AllBranchModel {
  content: BranchModel[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  search?: string;
  status?: string;
}

export interface BranchModel {
  id: number;
  branchCode: string;
  branchKh: string;
  createdAt:string;
  updatedAt :string;
}
