import { axiosClientWithAuth } from "@/utils/axios";
import axios from "axios";

export async function getAllPublicAccOnlineCategoryService(params: { search?: string }) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/public/master-data/acc-online-category/all",
      { search: params.search || "" }
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      throw { errorMessage: raw?.message || "Failed to fetch categories.", rawError: raw };
    }
    throw { errorMessage: "An unexpected error occurred while fetching categories." };
  }
}
