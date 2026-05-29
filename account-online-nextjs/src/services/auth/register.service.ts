import { axiosClient } from "@/utils/axios";

export interface RegisterRequest {
  username: string; // email
  password: string;
  fullName?: string;
  staffId?: string;
  phoneNumber?: string;
  position?: string;
  branch?: string;
}

export interface VerifyEmailRequest {
  username: string;
  code: string;
}

export async function registerService(data: RegisterRequest) {
  const response = await axiosClient.post("/api/v1/auth/register", data);
  return response.data;
}

export async function verifyEmailService(data: VerifyEmailRequest) {
  const response = await axiosClient.post("/api/v1/auth/verify-email", data);
  return response.data;
}
