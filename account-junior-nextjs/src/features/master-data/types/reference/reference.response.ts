export interface AllReferenceModel {
  content: ReferenceModel[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ReferenceModel {
  id: number;
  nameEn: string;
  nameKh: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}
