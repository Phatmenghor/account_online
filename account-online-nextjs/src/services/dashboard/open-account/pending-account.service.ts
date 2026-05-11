import axios from "axios";
import { axiosClientWithAuth } from "@/utils/axios";
import {
  GetAllPendingAccountsRequest,
  GetPendingAccountByIdRequest,
  ApprovePendingAccountRequest,
  RejectPendingAccountRequest,
} from "@/models/open-account-admin/pending-account.request";
import {
  PaginationResponse,
  PendingAccountAdminReviewDto,
  PendingAccountActionResponse,
} from "@/models/open-account-admin/pending-account.response";

/**
 * 🔹 Fetch all pending account requests with pagination
 */
export async function getAllPendingAccountsService(
  request: GetAllPendingAccountsRequest
): Promise<PaginationResponse<PendingAccountAdminReviewDto>> {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/admin/open-account/all-history",
      request
    );

    if (!response.data || !response.data.data) {
      throw new Error("Invalid response format: missing 'data' field.");
    }

    return response.data.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message =
        (raw as { message?: string })?.message ||
        "Failed to fetch pending accounts.";
      console.error("[getAllPendingAccountsService] Axios error:", message);
      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("[getAllPendingAccountsService] Unexpected error:", error);
      throw {
        errorMessage:
          "An unexpected error occurred while fetching pending accounts.",
        rawError: error,
      };
    }
  }
}

/**
 * 🔹 Fetch single pending account by ID
 */
export async function getPendingAccountDetailService(
  id: string
): Promise<PendingAccountAdminReviewDto> {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/admin/open-account/history-by-id/${id}`
    );

    if (!response.data || !response.data.data) {
      throw new Error("Invalid response format: missing 'data' field.");
    }

    return response.data.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message =
        (raw as { message?: string })?.message ||
        "Failed to fetch pending account detail.";
      console.error("[getPendingAccountDetailService] Axios error:", message);
      throw { errorMessage: message, rawError: raw };
    } else {
      console.error(
        "[getPendingAccountDetailService] Unexpected error:",
        error
      );
      throw {
        errorMessage:
          "An unexpected error occurred while fetching pending account detail.",
        rawError: error,
      };
    }
  }
}

/**
 * 🔹 Approve pending account request
 */
export async function approvePendingAccountService(
  request: ApprovePendingAccountRequest
): Promise<PendingAccountActionResponse> {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/public/open-account/approve",
      request
    );

    if (!response.data || !response.data.data) {
      throw new Error("Invalid response format: missing 'data' field.");
    }

    return response.data.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message =
        (raw as { message?: string })?.message ||
        "Failed to approve pending account.";
      console.error("[approvePendingAccountService] Axios error:", message);
      throw { errorMessage: message, rawError: raw };
    } else {
      console.error(
        "[approvePendingAccountService] Unexpected error:",
        error
      );
      throw {
        errorMessage:
          "An unexpected error occurred while approving pending account.",
        rawError: error,
      };
    }
  }
}

/**
 * 🔹 Reject pending account request
 */
export async function rejectPendingAccountService(
  request: RejectPendingAccountRequest
): Promise<PendingAccountActionResponse> {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/public/open-account/reject",
      request
    );

    if (!response.data || !response.data.data) {
      throw new Error("Invalid response format: missing 'data' field.");
    }

    return response.data.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message =
        (raw as { message?: string })?.message ||
        "Failed to reject pending account.";
      console.error("[rejectPendingAccountService] Axios error:", message);
      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("[rejectPendingAccountService] Unexpected error:", error);
      throw {
        errorMessage:
          "An unexpected error occurred while rejecting pending account.",
        rawError: error,
      };
    }
  }
}
