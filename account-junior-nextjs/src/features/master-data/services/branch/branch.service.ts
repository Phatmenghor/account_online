import { handleApiError } from '@/utils/axios/handleError';
import {
  AllBranchReq,
  CreateBranchReq,
  UpdateBranchReq,
} from "@/features/master-data/types/branch/branch.request";
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
    handleApiError(error, "Failed to fetch branch.");
  }
}

export async function getBranchByIdService(id: number) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/master-data/branches/get-by-id/${id}`
    );
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Failed to fetch branch by id.");
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
    handleApiError(error, "Failed to create province.");
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
    handleApiError(error, "Failed to update branch.");
  }
}

export async function deleteBranchService(id: number) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/master-data/branches/delete/${id}`
    );
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Failed to delete branch.");
  }
}


