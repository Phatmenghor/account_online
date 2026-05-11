import { CommuneModel } from "../commune/commune.response";

export interface AllVillageModel {
  content: VillageModel[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

export interface VillageModel {
  id: number;
  villageCode: string;
  villageEn: string;
  villageKh: string;
  createdAt: string;
  updatedAt: string;
  commune: CommuneModel;
}
