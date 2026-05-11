import {
  AllMaritalReq,
  AllPublicMaritalReq,
  CreateMaritalReq,
  UpdateMaritalReq,
} from "@/models/static/marital/marital.request";
import { axiosClientWithAuth } from "@/utils/axios";
import axios from "axios";

export async function getAllPublicMaritalService(request: AllPublicMaritalReq) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/public/master-data/marital-status/all",
      request
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch maritals.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while fetching maritals.",
        rawError: error,
      };
    }
  }
}

export async function getAllMaritalService(request: AllMaritalReq) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/marital-status/all",
      request
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch maritals.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while fetching maritals.",
        rawError: error,
      };
    }
  }
}

export async function getMaritalByIdService(id: number) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/marital-status/get-by-id/${id}`
    );
    return response.data.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch marital by id.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage:
          "An unexpected error occurred while fetching marital by id.",
        rawError: error,
      };
    }
  }
}

export async function createMaritalService(request: CreateMaritalReq) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/marital-status/create",
      request
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to create marital.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while creating marital.",
        rawError: error,
      };
    }
  }
}

export async function updateMaritalService(
  id: number,
  update: UpdateMaritalReq
) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/marital-status/update/${id}`,
      update
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to update marital.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while updating marital.",
        rawError: error,
      };
    }
  }
}

export async function deleteMaritalService(id: number) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/marital-status/delete/${id}`
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to delete marital.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while deleting marital.",
        rawError: error,
      };
    }
  }
}
