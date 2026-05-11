export interface AllUserReq {
  pageNo?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}

export interface UpdateUserReq {
  username?: string;
  email?: string;
  fullName?: string;
  status?: string;
  userPermission?: string;
  profileUrl?: string;
  position?: string;
}

export interface CreateUserReq {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  userPermission?: string;
  role?: string;
  position?: string;
}

export interface ChangePasswordReq {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ChangePasswordByAdminReq {
  id: number;
  newPassword: string;
  confirmNewPassword: string;
}
