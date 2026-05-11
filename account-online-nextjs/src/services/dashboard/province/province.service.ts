import {
  AllProvinceReq,
  CreateProvinceReq,
  UpdateProvinceReq,
} from "@/models/static/province/province.request";

import { axiosClientWithAuth } from "@/utils/axios";
import axios from "axios";

export async function getAllProviceService(request: AllProvinceReq) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/master-data/address/provinces/all",
      request
    );

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch province.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while fetching province.",
        rawError: error,
      };
    }
  }
}

export async function getProvinceByIdService(id: number) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/master-data/address/provinces/get-by-id/${id}`
    );
    return response.data.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch province by id.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage:
          "An unexpected error occurred while fetching province by id.",
        rawError: error,
      };
    }
  }
}

export async function createProvinceService(request: CreateProvinceReq) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/master-data/address/provinces/create",
      request
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to create province.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while creating province.",
        rawError: error,
      };
    }
  }
}

export async function updateProvinceService(
  id: number,
  update: UpdateProvinceReq
) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/master-data/address/provinces/update/${id}`,
      update
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to update province.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while updating province.",
        rawError: error,
      };
    }
  }
}

export async function deleteProvinceService(id: number) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/master-data/address/provinces/delete/${id}`
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to delete province.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while deleting province.",
        rawError: error,
      };
    }
  }
}
