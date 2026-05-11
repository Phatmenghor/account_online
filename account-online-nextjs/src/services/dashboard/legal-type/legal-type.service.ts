import {
  AllLegalTypeReq,
  AllPublicLegalTypeReq,
  CreateLegalTypeReq,
  UpdateLegalTypeReq,
} from "@/models/static/legal-type/legal-type.request";
import { axiosClientWithAuth } from "@/utils/axios";
import axios from "axios";

export async function getAllPublicLegalTypeService(
  request: AllPublicLegalTypeReq
) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/public/master-data/legal-type/all",
      request
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch legal types.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage:
          "An unexpected error occurred while fetching legal types.",
        rawError: error,
      };
    }
  }
}

export async function getAllLegalTypeService(request: AllLegalTypeReq) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/legal-type/all",
      request
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch legal types.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage:
          "An unexpected error occurred while fetching legal types.",
        rawError: error,
      };
    }
  }
}

export async function getLegalTypeByIdService(id: number) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/legal-type/get-by-id/${id}`
    );
    return response.data.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch legal type by id.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage:
          "An unexpected error occurred while fetching legal type by id.",
        rawError: error,
      };
    }
  }
}

export async function createLegalTypeService(request: CreateLegalTypeReq) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/legal-type/create",
      request
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to create legal type.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while creating legal type.",
        rawError: error,
      };
    }
  }
}

export async function updateLegalTypeService(
  id: number,
  update: UpdateLegalTypeReq
) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/legal-type/update/${id}`,
      update
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to update legal type.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while updating legal type.",
        rawError: error,
      };
    }
  }
}

export async function deleteLegalTypeService(id: number) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/legal-type/delete/${id}`
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to delete legal type.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while deleting legal type.",
        rawError: error,
      };
    }
  }
}
