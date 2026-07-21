import { DistrictModel } from "../district/district.response";

export interface AllCommuneModel {
  content: CommuneModel[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface CommuneModel {
  id: number;
  communeCode: string;
  communeEn: string;
  communeKh: string;
  createdAt: string;
  updatedAt: string;
  district: DistrictModel;
}
