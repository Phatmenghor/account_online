import { AllDistrictReq, CreateDistrictReq, UpdateDistrictReq } from "@/models/static/district/district.request";
import { axiosClientWithAuth } from "@/utils/axios";
import axios from "axios";

export async function getAllDistrictService(request: AllDistrictReq) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/master-data/address/districts/all",
      request
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch districts.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while fetching districts.",
        rawError: error,
      };
    }
  }
}

export async function getDistrictByIdService(id: number) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/master-data/address/districts/get-by-id/${id}`
    );
    return response.data.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch district by id.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage:
          "An unexpected error occurred while fetching district by id.",
        rawError: error,
      };
    }
  }
}

export async function createDistrictService(request: CreateDistrictReq) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/master-data/address/districts/create",
      request
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to create district.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while creating district.",
        rawError: error,
      };
    }
  }
}

export async function updateDistrictService(
  id: number,
  update: UpdateDistrictReq
) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/master-data/address/districts/update/${id}`,
      update
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to update district.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while updating district.",
        rawError: error,
      };
    }
  }
}

export async function deleteDistrictService(id: number) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/master-data/address/districts/delete/${id}`
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to delete district.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while deleting district.",
        rawError: error,
      };
    }
  }
}