import axios from "axios";
import { axiosClientWithAuth } from "@/utils/axios";
import {
  AllManagementRequest,
  UpdateAmlModel,
} from "@/features/aml/types/management/request/aml-management.request.model";

/**
 * 🔹 Fetch all AML management data
 */
export async function getAllAmlManagementService(
  request: AllManagementRequest
) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/aml/all-status",
      request
    );

    return response.data.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch AML management.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage:
          "An unexpected error occurred while fetching AML management.",
        rawError: error,
      };
    }
  }
}

/**
 * 🔹 Update management record by ID
 */
export async function updateManagementService(
  id: number,
  updates: UpdateAmlModel
) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/aml/update/${id}`,
      updates
    );

    // ✅ Ensure data is valid
    if (!response.data || !response.data.data) {
      throw new Error("Invalid response format: missing 'data' field.");
    }

    return response.data.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message =
        (raw as { message?: string })?.message ||
        "Failed to update AML management record.";
      console.error("[updateManagementService] Axios error:", message);
      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("[updateManagementService] Unexpected error:", error);
      throw {
        errorMessage:
          "An unexpected error occurred while updating AML management record.",
        rawError: error,
      };
    }
  }
}
export async function getAmlManagementByIdService(id: number) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/aml/status-by-id/${id}`
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


