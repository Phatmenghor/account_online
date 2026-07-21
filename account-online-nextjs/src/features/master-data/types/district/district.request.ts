export interface CreateDistrictReq {
  districtCode: string
  districtEn: string
  districtKh: string
  provinceCode: string
}

export interface UpdateDistrictReq {
  districtCode?: string
  districtEn?: string
  districtKh?: string
  provinceCode?: string
}

export interface AllDistrictReq {
  pageNo?: number;
  pageSize?: number;
  search?: string;
}

