export interface AllMaritalModel {
  content: MaritalModel[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface MaritalModel {
  id: number;
  nameEn: string;
  nameKh: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}
