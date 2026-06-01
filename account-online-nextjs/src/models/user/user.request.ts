export interface AllUserReq {
  pageNo?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  role?: string;
}

export interface UpdateUserReq {
  email?: string;
  fullName?: string;
  status?: string;
  position?: string;
  profileUrl?: string;
  staffId?: string;
  phoneNumber?: string;
  branch?: string;
  department?: string;
  userRole?: string;
}

export interface CreateUserReq {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  role?: string;
  position?: string;
  staffId?: string;
  phoneNumber?: string;
  branch?: string;
  department?: string;
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
