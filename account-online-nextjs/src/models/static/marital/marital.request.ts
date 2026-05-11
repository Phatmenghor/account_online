export interface CreateMaritalReq {
  nameEn: string;
  nameKh: string;
  status: string;
}

export interface UpdateMaritalReq {
  nameEn?: string;
  nameKh?: string;
  status?: string;
}

export interface AllMaritalReq {
  pageNo?: number;
  pageSize?: number;
  language?: string;
  search?: string;
  status?: string;
}

export interface AllPublicMaritalReq {
  search?: string;
}
