import {
  AllOccupationReq,
  AllPublicOccupationReq,
  CreateOccupationReq,
  UpdateOccupationReq,
} from "@/models/static/occupation/occupation.request";
import { axiosClientWithAuth } from "@/utils/axios";
import axios from "axios";

export async function getAllPublicOccupationService(
  request: AllPublicOccupationReq
) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/public/master-data/occupation/all",
      request
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch occupations.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage:
          "An unexpected error occurred while fetching occupations.",
        rawError: error,
      };
    }
  }
}

export async function getAllOccupationService(request: AllOccupationReq) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/occupation/all",
      request
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch occupations.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage:
          "An unexpected error occurred while fetching occupations.",
        rawError: error,
      };
    }
  }
}

export async function getOccupationByIdService(id: number) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/occupation/get-by-id/${id}`
    );
    return response.data.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch occupation by id.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage:
          "An unexpected error occurred while fetching occupation by id.",
        rawError: error,
      };
    }
  }
}

export async function createOccupationService(request: CreateOccupationReq) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/occupation/create",
      request
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to create occupation.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while creating occupation.",
        rawError: error,
      };
    }
  }
}

export async function updateOccupationService(
  id: number,
  update: UpdateOccupationReq
) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/occupation/update/${id}`,
      update
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to update occupation.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while updating occupation.",
        rawError: error,
      };
    }
  }
}

export async function deleteOccupationService(id: number) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/occupation/delete/${id}`
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to delete occupation.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while deleting occupation.",
        rawError: error,
      };
    }
  }
}
