import { LoginCredentials } from "@/models/auth/auth.request";
import { UpdateUserReq } from "@/models/user/user.request";
import { axiosClient } from "@/utils/axios";
import { storePermission } from "@/utils/local-storage/permission";
import { storeRole } from "@/utils/local-storage/roles";
import { getToken, storeRefreshToken, storeToken } from "@/utils/local-storage/token";
import { storeUserInfo } from "@/utils/local-storage/userInfo";

export async function loginService(credentials: LoginCredentials) {
  try {
    // Simulate async call and delay
    const response = await axiosClient.post("/api/v1/auth/login", credentials);

    // On success, store token and role with expiration time
    // If backend provides expiresIn, use it; otherwise use default (1 hour for access, 7 days for refresh)
    const accessTokenExpiresIn = response.data.data.expiresIn || 3600; // default 1 hour
    const refreshTokenExpiresIn = response.data.data.refreshTokenExpiresIn || 7 * 24 * 60 * 60; // default 7 days

    storeToken(response.data.data.accessToken, accessTokenExpiresIn);
    storeRefreshToken(response.data.data.refreshToken, refreshTokenExpiresIn);
    storeRole(response.data.data.userRole.userRole);
    storeUserInfo(response.data.data.userRole);
    storePermission(response?.data?.userRole?.userPermission);

    return response.data.data;
  } catch (error: any) {
    console.error("### Login service error:", error);
    throw error;
  }
}

export async function updateUserProfileService(updateData: UpdateUserReq) {
  try {
    // Simulate async call and delay
    const response = await axiosClient.post(
      "/api/v1/auth/token/update-profile",
      updateData,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );

    return response.data.data;
  } catch (error) {
    console.error("update profile service error:", error);

    // Re-throw or transform error if needed
    throw {
      errorMessage: "An unexpected error occurred during update profile.",
      rawError: error,
    };
  }
}
