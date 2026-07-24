export interface UpdateAmlModel {
  status: string;
  remark?: string;
}

export interface AllManagementRequest {
  pageNo?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}
