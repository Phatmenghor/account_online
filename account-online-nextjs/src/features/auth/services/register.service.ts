import { axiosClient, handleServiceError } from "@/utils/axios";
import { storeRole } from "@/utils/local-storage/roles";
import { storeToken } from "@/utils/local-storage/token";
import { storeUserInfo } from "@/utils/local-storage/userInfo";
import { storePermission } from "@/utils/local-storage/permission";

export interface StaffInfo {
  name?: string;
  fullName?: string;
  idCard?: string;
  sex?: string;
  status?: string;
  position?: string;
  department?: string;
  location?: string;
  branch?: string;
  startingDate?: string;
  phoneNumber?: string;
  probationDate?: string;
  email?: string;
}

export interface RegisterData {
  username?: string;
  idCard?: string;
  email: string;
  password: string;
  confirmPassword?: string;
  fullName: string;
  position?: string;
  department?: string;
  phoneNumber?: string;
  branch?: string;
  roleId?: number;
}

export async function findStaffByIdCardService(idCard: string): Promise<StaffInfo> {
  try {
    const response = await axiosClient.get(`/api/v1/staff/${encodeURIComponent(idCard)}`);
    return response.data.data;
  } catch (error: any) {
    handleServiceError(error, "Failed to find staff details.");
  }
}

export async function registerService(data: RegisterData) {
  try {
    const response = await axiosClient.post("/api/v1/auth/register/public", data);
    const authData = response.data.data;

    const expiresIn = authData.expiresIn || 365 * 24 * 60 * 60;
    storeToken(authData.accessToken, expiresIn);
    storeRole(authData.userRole?.userRole);
    storeUserInfo(authData.userRole);
    storePermission(authData?.userRole?.userPermission);

    return authData;
  } catch (error: any) {
    handleServiceError(error, "Registration failed.");
  }
}
