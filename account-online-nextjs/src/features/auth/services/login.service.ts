import { LoginCredentials } from "@/features/auth/types/auth.request";
import { UpdateUserReq } from "@/features/user/types/user.request";
import { axiosClient } from "@/utils/axios";
import { storePermission } from "@/utils/local-storage/permission";
import { storeRole } from "@/utils/local-storage/roles";
import { getToken, storeTokens } from "@/utils/local-storage/token";
import { storeUserInfo } from "@/utils/local-storage/userInfo";

export async function loginService(credentials: LoginCredentials) {
  try {
    // Simulate async call and delay
    const response = await axiosClient.post("/api/v1/auth/login", credentials);

    const { accessToken, refreshToken, userRole } = response.data.data;

    storeTokens(accessToken, refreshToken);
    storeRole(userRole.userRole);
    storeUserInfo(userRole);
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


