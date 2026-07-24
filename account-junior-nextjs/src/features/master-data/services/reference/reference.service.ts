import { handleApiError } from '@/utils/axios/handleError';
import {
  AllPublicReferenceReq,
  AllReferenceReq,
  CreateReferenceReq,
  UpdateReferenceReq,
} from "@/features/master-data/types/reference/reference.request";
import { axiosClientWithAuth } from "@/utils/axios";
import axios from "axios";

export async function getAllPublicReferenceService(
  request: AllPublicReferenceReq
) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/public/master-data/bank/all",
      request
    );
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Failed to fetch references.");
  }
}

export async function getAllReferenceService(request: AllReferenceReq) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/reference/banks/all",
      request
    );
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Failed to fetch references.");
  }
}

export async function getReferenceByIdService(id: number) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/reference/banks/get-by-id/${id}`
    );
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Failed to fetch reference by id.");
  }
}

export async function createReferenceService(request: CreateReferenceReq) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/reference/banks/create",
      request
    );
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Failed to create reference.");
  }
}

export async function updateReferenceService(
  id: number,
  update: UpdateReferenceReq
) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/reference/banks/update/${id}`,
      update
    );
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Failed to update reference.");
  }
}

export async function deleteReferenceService(id: number) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/reference/banks/delete/${id}`
    );
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Failed to delete reference.");
  }
}


