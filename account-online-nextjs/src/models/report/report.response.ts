export interface AllReportModel {
  content: ReportModel[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

export interface ReportModel {
  id: string
  idNumber : string
  status: string
  remark: string
  createdAt: string
}