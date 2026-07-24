import {
  CommuneModel,
  DistrictModel,
  ProvinceModel,
  VillageModel,
} from "@/types/address/address.response";

export interface Image {
  idImage: string;
}

export interface LocationData {
  province: string;
  district: string;
  commune: string;
  village: string;
}

export interface LocationSubmitData {
  currentAddress: {
    province: ProvinceModel | null;
    district: DistrictModel | null;
    commune: CommuneModel | null;
    village: VillageModel | null;
  };
  placeOfBirth: {
    province: ProvinceModel | null;
    district: DistrictModel | null;
    commune: CommuneModel | null;
    village: VillageModel | null;
  };
}

