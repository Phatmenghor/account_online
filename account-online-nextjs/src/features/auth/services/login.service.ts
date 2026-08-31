import { LoginCredentials } from "@/features/auth/types/auth.request";
import { UpdateUserReq } from "@/features/user/types/user.request";
import { axiosClient, axiosClientWithAuth, handleServiceError } from "@/utils/axios";
import { storePermission } from "@/utils/local-storage/permission";
import { storeRole } from "@/utils/local-storage/roles";
import { storeToken } from "@/utils/local-storage/token";
import { storeUserInfo } from "@/utils/local-storage/userInfo";

export async function loginService(credentials: LoginCredentials) {
  try {
    const response = await axiosClient.post("/api/v1/auth/login", credentials);
    const data = response.data?.data;

    if (data) {
      storeToken(data.accessToken);
      storeRole(data.userRole?.userRole);
      storeUserInfo(data.userRole);
      storePermission(data.userRole?.userPermission);
    }

    return data;
  } catch (error: any) {
    handleServiceError(error, "Login failed. Please check your credentials.");
  }
}

export async function updateUserProfileService(updateData: UpdateUserReq) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/auth/token/update-profile",
      updateData
    );
    return response.data?.data;
  } catch (error: any) {
    handleServiceError(error, "Failed to update profile.");
  }
}
