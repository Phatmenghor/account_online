import { axiosClientWithAuth } from "@/utils/axios";
import axios from "axios";
import { TopUserOpenAccount, TopAmlActionUser } from "@/models/dashboard/dashboard.model";

export async function getTopUsersOpenAccountService(): Promise<TopUserOpenAccount[]> {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/report/top-users-open-account"
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      throw { errorMessage: raw?.message || "Failed to fetch top users.", rawError: raw };
    }
    throw { errorMessage: "An unexpected error occurred.", rawError: error };
  }
}

export async function getTopAmlActionUsersService(): Promise<TopAmlActionUser[]> {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/report/top-aml-action-users"
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      throw { errorMessage: raw?.message || "Failed to fetch top AML users.", rawError: raw };
    }
    throw { errorMessage: "An unexpected error occurred.", rawError: error };
  }
}
