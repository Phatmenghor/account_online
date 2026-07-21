import { handleApiError } from '@/utils/axios/handleError';
import {
  AllLegalTypeReq,
  AllPublicLegalTypeReq,
  CreateLegalTypeReq,
  UpdateLegalTypeReq,
} from "@/features/master-data/types/legal-type/legal-type.request";
import { axiosClientWithAuth } from "@/utils/axios";
import axios from "axios";

export async function getAllPublicLegalTypeService(
  request: AllPublicLegalTypeReq
) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/public/master-data/legal-type/all",
      request
    );
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Failed to fetch legal types.");
  }
}

export async function getAllLegalTypeService(request: AllLegalTypeReq) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/legal-type/all",
      request
    );
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Failed to fetch legal types.");
  }
}

export async function getLegalTypeByIdService(id: number) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/legal-type/get-by-id/${id}`
    );
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Failed to fetch legal type by id.");
  }
}

export async function createLegalTypeService(request: CreateLegalTypeReq) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/legal-type/create",
      request
    );
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Failed to create legal type.");
  }
}

export async function updateLegalTypeService(
  id: number,
  update: UpdateLegalTypeReq
) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/legal-type/update/${id}`,
      update
    );
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Failed to update legal type.");
  }
}

export async function deleteLegalTypeService(id: number) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/legal-type/delete/${id}`
    );
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Failed to delete legal type.");
  }
}


