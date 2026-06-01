import { axiosClient } from "@/utils/axios";

export interface OpenAccLoginRequest {
  username: string;
  password: string;
}

export async function openAccLoginService(data: OpenAccLoginRequest) {
  const response = await axiosClient.post("/api/v1/auth/openacc/login", data);
  return response.data;
}
