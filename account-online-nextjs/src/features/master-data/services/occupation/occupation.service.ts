import { handleApiError } from '@/utils/axios/handleError';
import {
  AllOccupationReq,
  AllPublicOccupationReq,
  CreateOccupationReq,
  UpdateOccupationReq,
} from "@/features/master-data/types/occupation/occupation.request";
import { axiosClientWithAuth } from "@/utils/axios";
import axios from "axios";

export async function getAllPublicOccupationService(
  request: AllPublicOccupationReq
) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/public/master-data/occupation/all",
      request
    );
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Failed to fetch occupations.");
  }
}

export async function getAllOccupationService(request: AllOccupationReq) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/occupation/all",
      request
    );
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Failed to fetch occupations.");
  }
}

export async function getOccupationByIdService(id: number) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/occupation/get-by-id/${id}`
    );
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Failed to fetch occupation by id.");
  }
}

export async function createOccupationService(request: CreateOccupationReq) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/occupation/create",
      request
    );
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Failed to create occupation.");
  }
}

export async function updateOccupationService(
  id: number,
  update: UpdateOccupationReq
) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/occupation/update/${id}`,
      update
    );
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Failed to update occupation.");
  }
}

export async function deleteOccupationService(id: number) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/occupation/delete/${id}`
    );
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Failed to delete occupation.");
  }
}


