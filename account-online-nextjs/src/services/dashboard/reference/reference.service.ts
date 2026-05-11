import {
  AllPublicReferenceReq,
  AllReferenceReq,
  CreateReferenceReq,
  UpdateReferenceReq,
} from "@/models/static/reference/reference.request";
import { axiosClientWithAuth } from "@/utils/axios";
import axios from "axios";

export async function getAllPublicReferenceService(
  request: AllPublicReferenceReq
) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/public/master-data/bank/all",
      request
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch references.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while fetching references.",
        rawError: error,
      };
    }
  }
}

export async function getAllReferenceService(request: AllReferenceReq) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/reference/banks/all",
      request
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch references.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while fetching references.",
        rawError: error,
      };
    }
  }
}

export async function getReferenceByIdService(id: number) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/reference/banks/get-by-id/${id}`
    );
    return response.data.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch reference by id.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage:
          "An unexpected error occurred while fetching reference by id.",
        rawError: error,
      };
    }
  }
}

export async function createReferenceService(request: CreateReferenceReq) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/reference/banks/create",
      request
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to create reference.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while creating reference.",
        rawError: error,
      };
    }
  }
}

export async function updateReferenceService(
  id: number,
  update: UpdateReferenceReq
) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/reference/banks/update/${id}`,
      update
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to update reference.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while updating reference.",
        rawError: error,
      };
    }
  }
}

export async function deleteReferenceService(id: number) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/reference/banks/delete/${id}`
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to delete reference.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while deleting reference.",
        rawError: error,
      };
    }
  }
}
