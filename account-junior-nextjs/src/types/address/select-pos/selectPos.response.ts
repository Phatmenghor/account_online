// ✅ Main Response Model
export interface PosSelectResponse {
  status: string;
  message: string;
  data: PosSelectData;
}

export interface PosSelectData {
  province: ProvinceModel;
  district: DistrictModel;
  commune: CommuneModel;
  village: VillageModel;
}

// Province
export interface ProvinceModel {
  provinceCode: string;
  provinceEn: string;
  provinceKh: string;
}

// District
export interface DistrictModel {
  districtCode: string;
  districtEn: string;
  districtKh: string;
  provinceCode: string;
}

// Commune
export interface CommuneModel {
  communeCode: string;
  communeEn: string;
  communeKh: string;
  districtCode: string;
}

// Village
export interface VillageModel {
  villageCode: string;
  villageEn: string;
  villageKh: string;
  communeCode: string;
}
