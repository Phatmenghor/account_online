export interface AllUserModel {
  content: UserModel[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface UserModel {
  id: number;
  idCard: string;
  email: string;
  userRole: string;
  userStatus: string;
  fullName: string;
  userPermission: string;
  position: string;
  profileUrl: string;
  createdAt: string;
  updatedAt: string;
  lastLogin: string;
}
