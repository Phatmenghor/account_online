export interface AllReportRequestModel {
  fromDate: string;
  toDate: string;
  status: string[];
  pageNo: number;
  pageSize: number;
}

export interface AllReportExcelReq {
  fromDate: string;
  toDate: string;
}
