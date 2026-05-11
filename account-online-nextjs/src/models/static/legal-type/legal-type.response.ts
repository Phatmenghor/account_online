export interface AllLegalTypeModel {
  content: LegalTypeModel[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface LegalTypeModel {
  id: number;
  nameEn: string;
  nameKh: string;
  legalTypeValue: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}
