// Province
export interface AllProvinceModel {
  content: ProvinceModel[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  totalCount: number;
}

export interface ProvinceModel {
  provinceCode: string;
  provinceEn: string;
  provinceKh: string;
}

// District
export interface AllDistrictModel {
  content: DistrictModel[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  totalCount: number;
}

export interface DistrictModel {
  districtCode: string;
  districtEn: string;
  districtKh: string;
  provinceCode: string;
}

// Commune
export interface AllCommuneModel {
  content: CommuneModel[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  totalCount: number;
}

export interface CommuneModel {
  communeCode: string;
  communeEn: string;
  communeKh: string;
  districtCode: string;
}

// Village
export interface AllVillageModel {
  content: VillageModel[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  totalCount: number;
}

export interface VillageModel {
  villageCode: string;
  villageEn: string;
  villageKh: string;
  communeCode: string;
}