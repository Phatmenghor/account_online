export interface CreateOccupationReq {
  nameEn: string;
  nameKh: string;
  occupationCode: string;
  status: string;
}

export interface UpdateOccupationReq {
  nameEn?: string;
  nameKh?: string;
  occupationCode?: string;
  status?: string;
}

export interface AllOccupationReq {
  pageNo?: number;
  pageSize?: number;
  language?: string;
  search?: string;
  status?: string;
}

export interface AllPublicOccupationReq {
  search?: string;
}
