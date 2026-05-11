export interface AllProvinceModel {
  content: ProvinceModel[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  search?: string;
  status?: string;
}

export interface ProvinceModel {
  id: number;
  provinceCode: string;
  provinceEn: string;
  provinceKh: string;
  createdAt: string;
  updatedAt: string;
}
