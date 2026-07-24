import { handleApiError } from '@/utils/axios/handleError';
import { AllVillageReq, CreateVillageReq, UpdateVillageReq } from "@/features/master-data/types/village/village.request";
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
    handleApiError(error, "Failed to fetch villages.");
  }
}

export async function getVillageByIdService(id: number) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/master-data/address/villages/get-by-id/${id}`
    );
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Failed to fetch village by id.");
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
    handleApiError(error, "Failed to create village.");
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
    handleApiError(error, "Failed to update village.");
  }
}

export async function deleteVillageService(id: number) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/master-data/address/villages/delete/${id}`
    );
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Failed to delete village.");
  }
}

