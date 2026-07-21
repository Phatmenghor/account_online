import {
  AllUserReq,
  ChangePasswordByAdminReq,
  ChangePasswordReq,
  CreateUserReq,
  UpdateUserReq,
} from "@/features/user/types/user.request";
import { axiosClientWithAuth } from "@/utils/axios";
import { storePermission } from "@/utils/local-storage/permission";
import { storeRole } from "@/utils/local-storage/roles";
import { storeToken } from "@/utils/local-storage/token";
import { storeUserInfo } from "@/utils/local-storage/userInfo";
import axios from "axios";

export async function getUsersService(request: AllUserReq) {
  try {
    // Simulate API delay
    const response = await axiosClientWithAuth.post("/api/v1/user", request);

    return response.data.data;
  } catch (error) {
    // Axios error handling (optional for mock)
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch users.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while fetching users.",
        rawError: error,
      };
    }
  }
}

export async function getUserByIdService(id: number) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/user/getById/${id}`
    );
    return response.data.data;
  } catch (error: any) {
    // Axios error handling (optional for mock)
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch user by id.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while fetching user by id.",
        rawError: error,
      };
    }
  }
}

export async function createUserService(newUser: CreateUserReq) {
  try {
    // Simulate API delay
    const response = await axiosClientWithAuth.post(
      "/api/v1/user/create-user",
      newUser
    );

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to create user.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while creating user.",
        rawError: error,
      };
    }
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
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to update user.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while updating user.",
        rawError: error,
      };
    }
  }
}

// 🗑️ delete user
export async function deleteUserService(id: number) {
  try {
    // Simulate API delay
    const response = await axiosClientWithAuth.post(
      `/api/v1/user/deleteById/${id}`
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to delete user.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while deleting user.",
        rawError: error,
      };
    }
  }
}

export async function getUserProfileService() {
  try {
    // Simulate API delay
    const response = await axiosClientWithAuth.post(`/api/v1/user/token`);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch user.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while fetch user.",
        rawError: error,
      };
    }
  }
}

export async function ChangeUserPasswordByAdminService(
  req: ChangePasswordByAdminReq
) {
  try {
    // Simulate API delay
    const response = await axiosClientWithAuth.post(
      `/api/v1/user/change-password-by-admin`,
      req
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message =
        raw?.message || "Failed to change user password by admin.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage:
          "An unexpected error occurred while change user password by admin.",
        rawError: error,
      };
    }
  }
}

export async function forceChangePasswordService(newPassword: string, confirmNewPassword: string) {
  try {
    const response = await axiosClientWithAuth.post(`/api/v1/user/force-change-password`, {
      newPassword,
      confirmNewPassword,
    });
    const data = response.data.data;
    // Store fresh token and updated user info (response mirrors login structure)
    const expiresIn = data.expiresIn || 365 * 24 * 60 * 60;
    storeToken(data.accessToken, expiresIn);
    storeRole(data.userRole?.userRole);
    storeUserInfo(data.userRole);
    storePermission(data.userRole?.userPermission);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      throw new Error(raw?.message || "Failed to update password.");
    }
    throw new Error("An unexpected error occurred.");
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
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to change password.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while change password.",
        rawError: error,
      };
    }
  }
}


