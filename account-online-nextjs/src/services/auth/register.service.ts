import { axiosClient } from "@/utils/axios";
import { storeRole } from "@/utils/local-storage/roles";
import { storeToken } from "@/utils/local-storage/token";
import { storeUserInfo } from "@/utils/local-storage/userInfo";
import { storePermission } from "@/utils/local-storage/permission";

export interface StaffInfo {
  name: string;
  idCard: string;
  sex: string;
  status: string;
  position: string;
  department: string;
  location: string;
  startingDate: string;
  phoneNumber: string;
  probationDate: string;
  email: string;
}

export interface RegisterData {
  idCard: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  position: string;
  department?: string;
  phoneNumber?: string;
  branch?: string;
}

export async function findStaffByIdCardService(idCard: string): Promise<StaffInfo> {
  const response = await axiosClient.get(`/api/v1/staff/${encodeURIComponent(idCard)}`);
  return response.data.data;
}

export async function registerService(data: RegisterData) {
  const response = await axiosClient.post("/api/v1/auth/register/public", data);
  const authData = response.data.data;

  const expiresIn = authData.expiresIn || 365 * 24 * 60 * 60;
  storeToken(authData.accessToken, expiresIn);
  storeRole(authData.userRole.userRole);
  storeUserInfo(authData.userRole);
  storePermission(authData?.userRole?.userPermission);

  return authData;
}
