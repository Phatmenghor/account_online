import { axiosClientWithAuth } from "@/utils/axios";
import axios from "axios";
import { DailyCountItem, TopUserOpenAccount, TopAmlActionUser } from "@/models/dashboard/dashboard.model";

export async function getAccountOpeningChartService(fromDate: string, toDate: string): Promise<DailyCountItem[]> {
  try {
    const response = await axiosClientWithAuth.get("/api/v1/dashboard/account-opening-chart", {
      params: { fromDate, toDate },
    });
    return response.data.data ?? [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw { errorMessage: error.response?.data?.message || "Failed to fetch chart data." };
    }
    throw { errorMessage: "An unexpected error occurred." };
  }
}

export async function getAmlHitsChartService(fromDate: string, toDate: string): Promise<DailyCountItem[]> {
  try {
    const response = await axiosClientWithAuth.get("/api/v1/dashboard/aml-hits-chart", {
      params: { fromDate, toDate },
    });
    return response.data.data ?? [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw { errorMessage: error.response?.data?.message || "Failed to fetch AML chart data." };
    }
    throw { errorMessage: "An unexpected error occurred." };
  }
}

export async function getTopUsersOpenAccountService(): Promise<TopUserOpenAccount[]> {
  try {
    const response = await axiosClientWithAuth.get("/api/v1/dashboard/top-users-open-account");
    return response.data.data ?? [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw { errorMessage: error.response?.data?.message || "Failed to fetch top users." };
    }
    throw { errorMessage: "An unexpected error occurred." };
  }
}

export async function getTopAmlActionUsersService(): Promise<TopAmlActionUser[]> {
  try {
    const response = await axiosClientWithAuth.get("/api/v1/dashboard/top-aml-action-users");
    return response.data.data ?? [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw { errorMessage: error.response?.data?.message || "Failed to fetch top AML users." };
    }
    throw { errorMessage: "An unexpected error occurred." };
  }
}
