import { AllVillageReq, CreateVillageReq, UpdateVillageReq } from "@/models/static/village/village.request";
import { axiosClientWithAuth } from "@/utils/axios";
import axios from "axios";


export async function getAllVillageService(request: AllVillageReq) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/master-data/address/villages/all",
      request
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch villages.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while fetching villages.",
        rawError: error,
      };
    }
  }
}

export async function getVillageByIdService(id: number) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/master-data/address/villages/get-by-id/${id}`
    );
    return response.data.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch village by id.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage:
          "An unexpected error occurred while fetching village by id.",
        rawError: error,
      };
    }
  }
}

export async function createVillageService(request: CreateVillageReq) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/master-data/address/villages/create",
      request
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to create village.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while creating village.",
        rawError: error,
      };
    }
  }
}

export async function updateVillageService(
  id: number,
  update: UpdateVillageReq
) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/master-data/address/villages/update/${id}`,
      update
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to update village.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while updating village.",
        rawError: error,
      };
    }
  }
}

export async function deleteVillageService(id: number) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/master-data/address/villages/delete/${id}`
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to delete village.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while deleting village.",
        rawError: error,
      };
    }
  }
}