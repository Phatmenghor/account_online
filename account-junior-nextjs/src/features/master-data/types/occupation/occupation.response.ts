export interface AllOccupationModel {
  content: OccupationModel[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface OccupationModel {
  id: number;
  nameEn: string;
  nameKh: string;
  occupationCode: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}
