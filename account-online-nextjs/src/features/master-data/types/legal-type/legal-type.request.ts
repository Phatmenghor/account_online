export interface CreateLegalTypeReq {
  nameEn: string;
  nameKh: string;
  legalTypeValue: string;
  status: string;
}

export interface UpdateLegalTypeReq {
  nameEn?: string;
  nameKh?: string;
  legalTypeValue?: string;
  status?: string;
}

export interface AllLegalTypeReq {
  pageNo?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}

export interface AllPublicLegalTypeReq {
  search?: string;
}
