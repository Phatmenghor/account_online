import { handleApiError } from '@/utils/axios/handleError';
import { AllCommuneReq, CreateCommuneReq, UpdateCommuneReq } from "@/features/master-data/types/commune/commune.request";
import { AllCommuneModel } from "@/features/master-data/types/commune/commune.response";
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
    handleApiError(error, "Failed to fetch communes.");
  }
}

export async function getCommuneByIdService(id: number) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/master-data/address/communes/get-by-id/${id}`
    );
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Failed to fetch commune by id.");
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
    handleApiError(error, "Failed to create commune.");
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
    handleApiError(error, "Failed to update commune.");
  }
}

export async function deleteCommuneService(id: number) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/master-data/address/communes/delete/${id}`
    );
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Failed to delete commune.");
  }
}

