import axios from "axios";
import { axiosClientWithAuth } from "@/utils/axios";
import {
  GetAllPendingAccountsRequest,
  ApprovePendingAccountRequest,
  RejectPendingAccountRequest,
} from "@/models/open-account-admin/pending-account.request";
import {
  PaginationResponse,
  PendingAccountAdminReviewDto,
  PendingAccountActionResponse,
  ReviewHistoryResponseDto,
} from "@/models/open-account-admin/pending-account.response";

/**
 * 🔹 Fetch all account opening request history with pagination
 * Returns data from PendingAccountOpeningRequestHistory table
 * Supports filtering by status: "PENDING", "APPROVED", "REJECTED", or omit for all
 * Used for both pending-review (status: PENDING) and review-history (all statuses)
 */
export async function getAllPendingAccountsService(
  request: GetAllPendingAccountsRequest
): Promise<PaginationResponse<PendingAccountAdminReviewDto>> {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/admin/open-account/all-history",
      request
    );

    return response.data.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch account history.";
      console.error("[getAllPendingAccountsService] Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("[getAllPendingAccountsService] Unexpected error:", error);
      throw {
        errorMessage:
          "An unexpected error occurred while fetching account history.",
        rawError: error,
      };
    }
  }
}

/**
 * 🔹 Fetch pending account detail by ID
 */
export async function getPendingAccountDetailService(
  id: string
): Promise<PendingAccountAdminReviewDto> {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/admin/open-account/history-by-id/${id}`
    );

    return response.data.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch pending account detail.";
      console.error("[getPendingAccountDetailService] Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("[getPendingAccountDetailService] Unexpected error:", error);
      throw {
        errorMessage:
          "An unexpected error occurred while fetching pending account detail.",
        rawError: error,
      };
    }
  }
}

/**
 * 🔹 Approve pending account
 */
export async function approvePendingAccountService(
  request: ApprovePendingAccountRequest
): Promise<PendingAccountActionResponse> {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/public/open-account/approve",
      request
    );

    return response.data.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to approve pending account.";
      console.error("[approvePendingAccountService] Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("[approvePendingAccountService] Unexpected error:", error);
      throw {
        errorMessage:
          "An unexpected error occurred while approving pending account.",
        rawError: error,
      };
    }
  }
}

/**
 * 🔹 Reject pending account
 */
export async function rejectPendingAccountService(
  request: RejectPendingAccountRequest
): Promise<PendingAccountActionResponse> {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/public/open-account/reject",
      request
    );

    return response.data.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to reject pending account.";
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

/**
 * 🔹 Fetch review history (audit trail) for a specific request
 */
export async function getReviewHistoryService(
  requestId: string
): Promise<ReviewHistoryResponseDto> {
  try {
    const response = await axiosClientWithAuth.get(
      `/api/v1/admin/open-account/review-history/${requestId}`
    );

    return response.data.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch review history.";
      console.error("[getReviewHistoryService] Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("[getReviewHistoryService] Unexpected error:", error);
      throw {
        errorMessage:
          "An unexpected error occurred while fetching review history.",
        rawError: error,
      };
    }
  }
}
