// ✅ Main Response Model
export interface AddressSelectResponse {
  status: string;
  message: string;
  data: AddressSelectData;
}

export interface AddressSelectData {
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
