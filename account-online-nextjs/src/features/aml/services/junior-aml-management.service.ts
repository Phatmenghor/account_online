import { axiosClientWithAuth } from "@/utils/axios";
import { handleApiError } from "@/utils/axios/handleError";
import {
  AllManagementRequest,
  UpdateAmlModel,
} from "@/features/aml/types/management/request/aml-management.request.model";

/**
 * 🔹 Fetch all Junior AML management data
 */
export async function getAllJuniorAmlManagementService(
  request: AllManagementRequest
) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/junior-aml/all-status",
      request
    );

    return response.data.data;
  } catch (error: unknown) {
    handleApiError(error, "Failed to fetch Junior AML management.");
  }
}

/**
 * 🔹 Update Junior AML record by ID
 */
export async function updateJuniorAmlManagementService(
  id: number,
  updates: UpdateAmlModel
) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/junior-aml/update/${id}`,
      updates
    );

    if (!response.data || !response.data.data) {
      throw new Error("Invalid response format: missing 'data' field.");
    }

    return response.data.data;
  } catch (error: unknown) {
    handleApiError(error, "Failed to update Junior AML record.");
  }
}
