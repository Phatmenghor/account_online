export interface AuthResponse {
  status: string;
  message: string;
  data: AuthModel;
}

export interface AuthModel {
  accessToken: string;
  tokenType: string;
  userRole: UserRole;
  fullToken: string;
  refreshToken: string;
}

export interface UserRole {
  id: number;
  idCard: string;
  email: string;
  userRole: string;
  userStatus: string;
  fullName: string;
  position: string;
  profileUrl: string;
  createdAt: string;
  updatedAt: string;
  lastLogin: string;
}
