export interface CreateReferenceReq {
  nameEn: string;
  nameKh: string;
  status: string;
}

export interface UpdateReferenceReq {
  nameEn?: string;
  nameKh?: string;
  status?: string;
}

export interface AllReferenceReq {
  pageNo?: number;
  pageSize?: number;
  language?: string;
  search?: string;
  status?: string;
}
export interface AllPublicReferenceReq {
  search?: string;
}
