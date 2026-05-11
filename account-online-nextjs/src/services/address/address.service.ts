import { AddressRequest } from "@/models/address/address.request";
import { axiosClientWithAuth } from "@/utils/axios";
import axios from "axios";

export async function getAllProvinceService(request: AddressRequest) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/public/master-data/province",
      request
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch provinces.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while fetching provinces.",
        rawError: error,
      };
    }
  }
}

export async function getAllDistrictService(
  provinceCode: string,
  request: AddressRequest
) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/public/master-data/district/${provinceCode}`,
      request
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch districts.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while fetching districts.",
        rawError: error,
      };
    }
  }
}

export async function getAllCommuneService(
  districtCode: string,
  request: AddressRequest
) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/public/master-data/commune/${districtCode}`,
      request
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch communes.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while fetching communes.",
        rawError: error,
      };
    }
  }
}

export async function getAllVillageService(
  communeCode: string,
  request: AddressRequest
) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/public/master-data/village/${communeCode}`,
      request
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch villages.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while fetching villages.",
        rawError: error,
      };
    }
  }
}