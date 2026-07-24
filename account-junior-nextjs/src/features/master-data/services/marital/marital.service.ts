import { handleApiError } from '@/utils/axios/handleError';
import {
  AllMaritalReq,
  AllPublicMaritalReq,
  CreateMaritalReq,
  UpdateMaritalReq,
} from "@/features/master-data/types/marital/marital.request";
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
    handleApiError(error, "Failed to fetch maritals.");
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
    handleApiError(error, "Failed to fetch maritals.");
  }
}

export async function getMaritalByIdService(id: number) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/marital-status/get-by-id/${id}`
    );
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Failed to fetch marital by id.");
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
    handleApiError(error, "Failed to create marital.");
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
    handleApiError(error, "Failed to update marital.");
  }
}

export async function deleteMaritalService(id: number) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/marital-status/delete/${id}`
    );
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Failed to delete marital.");
  }
}


