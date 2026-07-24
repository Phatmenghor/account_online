import { SendOtpReq, VerifyOtpReq } from "@/features/account-opening/types/otp.request";
import { axiosClientWithAuth } from "@/utils/axios";

export interface PhoneCheckResult {
  hasAccount: boolean;
  cif?: string;
  mobile?: string;
}

/**
 * Pre-check: is this phone already registered in MB Core?
 * Call this BEFORE sendOtpService to warn the user.
 */
export async function checkPhoneService(phone: string): Promise<PhoneCheckResult> {
  const response = await axiosClientWithAuth.get(
    `/api/v1/public/otp/check-phone`,
    { params: { phone } }
  );
  return response.data.data as PhoneCheckResult;
}

export async function sendOtpService(data: SendOtpReq) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/public/otp/send",
      data
    );
    return response.data.data;
  } catch (error: any) {
    throw error;
  }
}

export async function verifiedOtpService(data: VerifyOtpReq) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/public/otp/verify",
      data
    );
    return response.data.data;
  } catch (error: any) {
    throw error;
  }
}
