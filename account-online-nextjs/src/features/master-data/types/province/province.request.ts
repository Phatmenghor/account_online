export interface CreateProvinceReq {
  provinceCode: string;
  provinceEn: string;
  provinceKh: string;
}

export interface UpdateProvinceReq {
  provinceCode?: string;
  provinceEn?: string;
  provinceKh?: string;
}

export interface AllProvinceReq {
  pageNo: number;
  pageSize: number;
  search?: string;
  status?: string;
}
