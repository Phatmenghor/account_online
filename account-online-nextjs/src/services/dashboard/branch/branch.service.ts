import {
  AllBranchReq,
  CreateBranchReq,
  UpdateBranchReq,
} from "@/models/static/branch/branch.request";
import { axiosClientWithAuth } from "@/utils/axios";
import axios from "axios";

export async function getAllBranchService(request: AllBranchReq) {
  try {
    const response = await axiosClientWithAuth.post(
      "api/v1/master-data/branches/all",
      request
    );
    console.log("this is branch ", response);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch branch.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while fetching branch.",
        rawError: error,
      };
    }
  }
}

export async function getBranchByIdService(id: number) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/master-data/branches/get-by-id/${id}`
    );
    return response.data.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch branch by id.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage:
          "An unexpected error occurred while fetching branch by id.",
        rawError: error,
      };
    }
  }
}

export async function createBranchService(request: CreateBranchReq) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/master-data/branches/create",
      request
    );
    console.log("this request >>", request);
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

export async function updateBranchService(id: number, update: UpdateBranchReq) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/master-data/branches/update/${id}`,
      update
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to update branch.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while updating branch.",
        rawError: error,
      };
    }
  }
}

export async function deleteBranchService(id: number) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/master-data/branches/delete/${id}`
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to delete branch.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while deleting branch.",
        rawError: error,
      };
    }
  }
}
