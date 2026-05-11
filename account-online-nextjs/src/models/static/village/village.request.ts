export interface CreateVillageReq {
  villageCode: string
  villageEn: string
  villageKh: string
  communeCode: string
}

export interface UpdateVillageReq {
  villageCode?: string
  villageEn?: string
  villageKh?: string
  communeCode?: string
}

export interface AllVillageReq {
  pageNo?: number;
  pageSize?: number;
  search?: string;
}