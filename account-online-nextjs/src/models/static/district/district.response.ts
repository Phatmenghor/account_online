import { ProvinceModel } from "../province/province.response";

export interface AllDistrictModel {
  content: DistrictModel[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface DistrictModel {
  id: number;
  districtCode: string;
  districtEn: string;
  districtKh: string;
  createdAt: string;
  updatedAt: string;
  province: ProvinceModel;
}
