export interface SendOtpResponse {
  status: string;
  message: string;
  data: SendOtpModel;
}

export interface SendOtpModel {
    phone: string;
    message: string;
    expiresAt: string;
}

export interface VerifyOtpRes {
  status: string;
  message: string;
  data: VerifyOtpModel;
}

export interface VerifyOtpModel {
  verified: boolean;
  phone: string;
  message: string;
}