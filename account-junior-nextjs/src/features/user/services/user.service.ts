import {
  AllUserReq,
  ChangePasswordByAdminReq,
  ChangePasswordReq,
  CreateUserReq,
  UpdateUserReq,
} from "@/features/user/types/user.request";
import { axiosClientWithAuth, handleServiceError } from "@/utils/axios";
import { storePermission } from "@/utils/local-storage/permission";
import { storeRole } from "@/utils/local-storage/roles";
import { storeToken } from "@/utils/local-storage/token";
import { storeUserInfo } from "@/utils/local-storage/userInfo";

export async function getUsersService(request: AllUserReq) {
  try {
    const response = await axiosClientWithAuth.post("/api/v1/user", request);
    return response.data.data;
  } catch (error) {
    handleServiceError(error, "Failed to fetch users.");
  }
}

export async function getUserByIdService(id: number) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/user/getById/${id}`
    );
    return response.data.data;
  } catch (error) {
    handleServiceError(error, "Failed to fetch user by id.");
  }
}

export async function createUserService(newUser: CreateUserReq) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/user/create-user",
      newUser
    );
    return response.data.data;
  } catch (error) {
    handleServiceError(error, "Failed to create user.");
  }
}

export async function updateUserService(id: number, updates: UpdateUserReq) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/user/updateById/${id}`,
      updates
    );
    return response.data.data;
  } catch (error) {
    handleServiceError(error, "Failed to update user.");
  }
}

export async function deleteUserService(id: number) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/user/deleteById/${id}`
    );
    return response.data.data;
  } catch (error) {
    handleServiceError(error, "Failed to delete user.");
  }
}

let userProfilePromise: Promise<any> | null = null;

export async function getUserProfileService() {
  if (userProfilePromise) {
    return userProfilePromise;
  }

  userProfilePromise = (async () => {
    try {
      const response = await axiosClientWithAuth.post(`/api/v1/user/token`);
      return response.data?.data ?? null;
    } catch (error) {
      handleServiceError(error, "Failed to fetch user.");
    } finally {
      setTimeout(() => {
        userProfilePromise = null;
      }, 500);
    }
  })();

  return userProfilePromise;
}

export async function ChangeUserPasswordByAdminService(
  req: ChangePasswordByAdminReq
) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/user/change-password-by-admin`,
      req
    );
    return response.data.data;
  } catch (error) {
    handleServiceError(error, "Failed to change user password by admin.");
  }
}

export async function forceChangePasswordService(newPassword: string, confirmNewPassword: string) {
  try {
    const response = await axiosClientWithAuth.post(`/api/v1/user/force-change-password`, {
      newPassword,
      confirmNewPassword,
    });
    const data = response.data.data;
    const expiresIn = data.expiresIn || 365 * 24 * 60 * 60;
    storeToken(data.accessToken, expiresIn);
    storeRole(data.userRole?.userRole);
    storeUserInfo(data.userRole);
    storePermission(data.userRole?.userPermission);
    return data;
  } catch (error) {
    handleServiceError(error, "Failed to update password.");
  }
}

export async function ChangePasswordService(req: ChangePasswordReq) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/user/change-password`,
      req
    );
    return response.data.data;
  } catch (error) {
    handleServiceError(error, "Failed to change password.");
  }
}
