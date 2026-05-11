import { AllCommuneReq, CreateCommuneReq, UpdateCommuneReq } from "@/models/static/commune/commune.request";
import { AllCommuneModel } from "@/models/static/commune/commune.response";
import { axiosClientWithAuth } from "@/utils/axios";
import axios from "axios";

export async function getAllCommuneService(request: AllCommuneReq) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/master-data/address/communes/all",
      request
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch communes.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while fetching communes.",
        rawError: error,
      };
    }
  }
}

export async function getCommuneByIdService(id: number) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/master-data/address/communes/get-by-id/${id}`
    );
    return response.data.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch commune by id.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage:
          "An unexpected error occurred while fetching commune by id.",
        rawError: error,
      };
    }
  }
}

export async function createCommuneService(request: CreateCommuneReq) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/master-data/address/communes/create",
      request
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to create commune.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while creating commune.",
        rawError: error,
      };
    }
  }
}

export async function updateCommuneService(
  id: number,
  update: UpdateCommuneReq
) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/master-data/address/communes/update/${id}`,
      update
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to update commune.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while updating commune.",
        rawError: error,
      };
    }
  }
}

export async function deleteCommuneService(id: number) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/master-data/address/communes/delete/${id}`
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to delete commune.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while deleting commune.",
        rawError: error,
      };
    }
  }
}