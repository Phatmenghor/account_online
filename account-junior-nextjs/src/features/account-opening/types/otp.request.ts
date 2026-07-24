export interface SendOtpReq {
    phone: string
}

export interface VerifyOtpReq {
  phone: string
  otpCode: string
}