import { handleApiError } from '@/utils/axios/handleError';
import { AllDistrictReq, CreateDistrictReq, UpdateDistrictReq } from "@/features/master-data/types/district/district.request";
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
    handleApiError(error, "Failed to fetch districts.");
  }
}

export async function getDistrictByIdService(id: number) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/master-data/address/districts/get-by-id/${id}`
    );
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Failed to fetch district by id.");
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
    handleApiError(error, "Failed to create district.");
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
    handleApiError(error, "Failed to update district.");
  }
}

export async function deleteDistrictService(id: number) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/master-data/address/districts/delete/${id}`
    );
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Failed to delete district.");
  }
}

