import { handleApiError } from '@/utils/axios/handleError';
import {
  AllProvinceReq,
  CreateProvinceReq,
  UpdateProvinceReq,
} from "@/features/master-data/types/province/province.request";

import { axiosClientWithAuth } from "@/utils/axios";
import axios from "axios";

export async function getAllProviceService(request: AllProvinceReq) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/master-data/address/provinces/all",
      request
    );

    return response.data.data;
  } catch (error) {
    handleApiError(error, "Failed to fetch province.");
  }
}

export async function getProvinceByIdService(id: number) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/master-data/address/provinces/get-by-id/${id}`
    );
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Failed to fetch province by id.");
  }
}

export async function createProvinceService(request: CreateProvinceReq) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/master-data/address/provinces/create",
      request
    );
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Failed to create province.");
  }
}

export async function updateProvinceService(
  id: number,
  update: UpdateProvinceReq
) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/master-data/address/provinces/update/${id}`,
      update
    );
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Failed to update province.");
  }
}

export async function deleteProvinceService(id: number) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/master-data/address/provinces/delete/${id}`
    );
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Failed to delete province.");
  }
}


