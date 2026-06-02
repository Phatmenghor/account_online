import { axiosClient } from "@/utils/axios";
import { storeRole } from "@/utils/local-storage/roles";
import { storeToken } from "@/utils/local-storage/token";
import { storeUserInfo } from "@/utils/local-storage/userInfo";
import { storePermission } from "@/utils/local-storage/permission";

export interface RegisterInitiateData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName?: string;
  position?: string;
  staffId?: string;
  phoneNumber?: string;
  branch?: string;
}

export interface RegisterInitiateResponse {
  message: string;
  email: string;
  expiresAt: string;
}

export async function registerInitiateService(data: RegisterInitiateData): Promise<RegisterInitiateResponse> {
  const response = await axiosClient.post("/api/v1/auth/register/initiate", data);
  return response.data.data;
}

export async function registerVerifyService(email: string, otpCode: string) {
  const response = await axiosClient.post("/api/v1/auth/register/verify", { email, otpCode });
  const authData = response.data.data;

  const expiresIn = authData.expiresIn || 365 * 24 * 60 * 60;
  storeToken(authData.accessToken, expiresIn);
  storeRole(authData.userRole.userRole);
  storeUserInfo(authData.userRole);
  storePermission(authData?.userRole?.userPermission);

  return authData;
}
