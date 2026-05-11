import { SendOtpReq, VerifyOtpReq } from "@/models/otp/otp.request";
import { axiosClientWithAuth } from "@/utils/axios";

export async function SendOtpService(data: SendOtpReq) {
  try {
    const response = await axiosClientWithAuth.post("/api/v1/public/otp/send", data);

    return response.data.data;
  } catch (error: any) {
    // Don't return null - throw the error so it can be handled properly
    throw error;
  }
}


export async function VerifyOtpService(data: VerifyOtpReq) {
    try {
        const response = await axiosClientWithAuth.post("/api/v1/public/otp/verify", data);
        return response.data.data;
    } catch (error: any) {
        throw error;
    }
}

