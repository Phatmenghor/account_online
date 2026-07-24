export interface CreateCommuneReq {
  communeCode: string
  communeEn: string
  communeKh: string
  districtCode: string
}

export interface UpdateCommuneReq {
  communeCode?: string
  communeEn?: string
  communeKh?: string
  districtCode?: string
}

export interface AllCommuneReq {
  pageNo?: number;
  pageSize?: number;
  search?: string;
}