"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle } from "lucide-react";
import { AppToast } from "@/components/shared/toast/app-toast";
import { SendOtpService, VerifyOtpService } from "@/services/otp/otp.service";
import { SendOtpReq, VerifyOtpReq } from "@/models/otp/otp.request";
import { useTranslations } from "next-intl";

interface OTPInputProps {
  phoneNumber: string;
  onPhoneChange: (value: string) => void;
  onVerificationSuccess?: () => void;
  disabled?: boolean;
  validationErrors?: Record<string, string>;
  onValidationChange?: (field: string, error: string | null) => void;
  reset?: boolean;
}

export default function OTPInput({
  phoneNumber,
  onPhoneChange,
  onVerificationSuccess,
  disabled = false,
  validationErrors = {},
  onValidationChange,
  reset,
}: OTPInputProps) {
  const [otpCode, setOtpCode] = useState<string>("");
  const [isOtpSent, setIsOtpSent] = useState<boolean>(false);
  const [isOtpVerified, setIsOtpVerified] = useState<boolean>(false);
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);
  const [otpExpiresAt, setOtpExpiresAt] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(0);
  const [lastVerifiedOtp, setLastVerifiedOtp] = useState<string>("");

  const translate = useTranslations("NIDPage");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  const isValidPhoneNumber = useCallback((phone: string): boolean => {
    return /^[0-9]{9,15}$/.test(phone.replace(/\s/g, ""));
  }, []);

  const validateField = useCallback(
    (field: string, value: any, errorMessage?: string) => {
      if (onValidationChange) {
        onValidationChange(field, errorMessage || null);
      }
    },
    [onValidationChange]
  );

  const handlePhoneChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    onPhoneChange(numericValue);

    if (numericValue.trim() === "") {
      validateField("phoneNumber", numericValue, translate("err_phoneNumber_min"));
    } else if (!isValidPhoneNumber(numericValue)) {
      validateField("phoneNumber", numericValue, translate("err_phoneNumber_regex"));
    } else {
      validateField("phoneNumber", numericValue);
    }

    if (numericValue !== phoneNumber) {
      setIsOtpSent(false);
      setIsOtpVerified(false);
      setOtpCode("");
      setOtpExpiresAt("");
      setCountdown(0);
      validateField("isPhoneVerified", false, translate("err_isPhoneVerified"));
    }
  };

  const handleSendOtp = useCallback(async () => {
    if (!phoneNumber.trim()) {
      validateField("phoneNumber", phoneNumber, translate("err_phoneNumber_min"));
      AppToast({
        type: "error",
        message: translate("otp_phone_required"),
        description: translate("otp_phone_required_desc"),
      });
      return;
    }

    if (!isValidPhoneNumber(phoneNumber)) {
      validateField("phoneNumber", phoneNumber, translate("err_phoneNumber_regex"));
      AppToast({
        type: "error",
        message: translate("otp_invalid_phone"),
        description: translate("otp_invalid_phone_desc"),
      });
      return;
    }

    if (countdown > 0) {
      AppToast({
        type: "warning",
        message: translate("otp_please_wait"),
        description: translate("otp_resend_wait").replace("{n}", String(countdown)),
      });
      return;
    }

    setIsSendingOtp(true);
    try {
      const requestData: SendOtpReq = { phone: phoneNumber.replace(/\s/g, "") };
      const response = await SendOtpService(requestData);

      setIsOtpSent(true);
      setOtpExpiresAt(response?.expiresAt ?? "");
      setCountdown(60);
      setOtpCode("");
      validateField("phoneNumber", phoneNumber);

      AppToast({
        type: "success",
        message: translate("otp_sent_success"),
        description: translate("otp_sent_success_desc").replace("{phone}", phoneNumber),
      });
    } catch (error: any) {
      console.error("Failed to send OTP:", error);
      validateField("phoneNumber", phoneNumber, translate("otp_send_fail_desc"));
      AppToast({
        type: "error",
        message: translate("otp_send_fail"),
        description: error.response?.data?.message || error.message || translate("otp_try_again"),
      });
      setIsOtpSent(false);
    } finally {
      setIsSendingOtp(false);
    }
  }, [phoneNumber, isValidPhoneNumber, countdown, validateField, translate]);

  const handlePhoneBlur = async () => {
    if (!phoneNumber.trim() || isOtpVerified || countdown > 0) return;
    if (isValidPhoneNumber(phoneNumber)) {
      await handleSendOtp();
    } else {
      validateField("phoneNumber", phoneNumber, translate("err_phoneNumber_regex"));
    }
  };

  const handleOtpChange = (value: string) => {
    if (!phoneNumber.trim()) {
      validateField("phoneNumber", phoneNumber, translate("otp_phone_required_first"));
      AppToast({
        type: "warning",
        message: translate("otp_phone_required"),
        description: translate("otp_phone_enter_first"),
      });
      return;
    }

    const numericValue = value.replace(/\D/g, "").slice(0, 6);
    setOtpCode(numericValue);

    if (numericValue && phoneNumber.trim()) {
      validateField("isPhoneVerified", false);
    }
    if (numericValue.length < 6) {
      setLastVerifiedOtp("");
    }
  };

  const handleVerifyOtp = useCallback(
    async (currentOtpCode: string) => {
      if (!phoneNumber.trim()) {
        validateField("phoneNumber", phoneNumber, translate("otp_phone_required_first"));
        AppToast({
          type: "error",
          message: translate("otp_phone_required"),
          description: translate("otp_phone_enter_first"),
        });
        return;
      }

      if (!currentOtpCode.trim()) {
        validateField("isPhoneVerified", false, translate("otp_code_required"));
        AppToast({ type: "error", message: translate("otp_required"), description: translate("otp_required_desc") });
        return;
      }

      if (currentOtpCode.length !== 6) {
        validateField("isPhoneVerified", false, translate("otp_must_6"));
        AppToast({ type: "error", message: translate("otp_invalid"), description: translate("otp_invalid_desc") });
        return;
      }

      if (!isOtpSent) {
        validateField("isPhoneVerified", false, translate("otp_request_first"));
        AppToast({ type: "error", message: translate("otp_not_sent"), description: translate("otp_not_sent_desc") });
        return;
      }

      setIsVerifyingOtp(true);
      try {
        const requestData: VerifyOtpReq = {
          phone: phoneNumber.replace(/\s/g, ""),
          otpCode: currentOtpCode,
        };

        const response = await VerifyOtpService(requestData);

        if (response?.verified) {
          setIsOtpVerified(true);
          setCountdown(0);
          setLastVerifiedOtp(currentOtpCode);
          validateField("isPhoneVerified", true);

          AppToast({
            type: "success",
            message: translate("otp_verify_success"),
            description: translate("otp_verify_success_desc"),
          });

          if (onVerificationSuccess) onVerificationSuccess();
        } else {
          setLastVerifiedOtp(currentOtpCode);
          validateField("isPhoneVerified", false, translate("otp_verify_fail_desc"));
          AppToast({
            type: "error",
            message: translate("otp_verify_fail"),
            description: response.message || translate("otp_verify_fail_desc"),
          });
        }
      } catch (error: any) {
        console.error("Failed to verify OTP:", error);
        setLastVerifiedOtp(currentOtpCode);
        const errorMsg = error.response?.data?.message || translate("otp_verify_fail_desc");
        validateField("isPhoneVerified", false, errorMsg);
        AppToast({ type: "error", message: translate("otp_verify_fail"), description: errorMsg });
        setIsOtpVerified(false);
      } finally {
        setIsVerifyingOtp(false);
      }
    },
    [isOtpSent, phoneNumber, onVerificationSuccess, validateField, translate]
  );

  useEffect(() => {
    if (
      phoneNumber.trim() &&
      otpCode.length === 6 &&
      /^\d{6}$/.test(otpCode) &&
      !isOtpVerified &&
      !isVerifyingOtp &&
      otpCode !== lastVerifiedOtp
    ) {
      handleVerifyOtp(otpCode);
    }
  }, [otpCode, phoneNumber, isOtpVerified, isVerifyingOtp, lastVerifiedOtp, handleVerifyOtp]);

  useEffect(() => {
    if (reset) {
      setOtpCode("");
      setIsOtpSent(false);
      setIsOtpVerified(false);
      setOtpExpiresAt("");
      setCountdown(0);
      setLastVerifiedOtp("");
      setIsSendingOtp(false);
      setIsVerifyingOtp(false);
    }
  }, [reset]);

  return (
    <>
      {/* Contact Number */}
      <div>
        <label className="text-sm sm:text-base font-medium text-gray-700 block mb-1">
          {translate("contactNumber")}
        </label>
        <div className="relative">
          <Input
            placeholder={translate("contactNumber")}
            value={phoneNumber}
            onChange={(e) => handlePhoneChange(e.target.value)}
            onBlur={handlePhoneBlur}
            className={`w-full h-10 text-sm ${validationErrors.phoneNumber ? "border-red-500" : ""}`}
            disabled={disabled || isSendingOtp}
            maxLength={15}
          />
          {isSendingOtp && (
            <Loader2 className="absolute right-3 top-2.5 h-5 w-5 animate-spin text-primary" />
          )}
          {isOtpVerified && !isSendingOtp && (
            <CheckCircle className="absolute right-3 top-2.5 h-5 w-5 text-green-600" />
          )}
        </div>
        {validationErrors.phoneNumber && (
          <p className="text-xs text-red-500 mt-1">{translate("err_phoneNumber_regex")}</p>
        )}
      </div>

      {/* OTP Code */}
      <div>
        <label className="text-sm sm:text-base font-medium text-gray-700 block mb-1">
          {translate("otpCode")}
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={countdown > 0 || disabled || isSendingOtp || isOtpVerified}
            className={`float-right text-sm font-semibold bg-transparent border-none p-0 transition-colors duration-200 ${
              countdown > 0 || disabled || isSendingOtp || isOtpVerified
                ? "text-gray-400 cursor-not-allowed"
                : "text-primary hover:text-primary/70 cursor-pointer"
            }`}
          >
            {isSendingOtp ? (
              <span className="flex items-center gap-1">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {translate("loading")}
              </span>
            ) : countdown > 0 ? (
              `${isOtpSent ? translate("reSendOtp") : translate("sendOtp")} (${countdown}s)`
            ) : isOtpSent ? (
              translate("reSendOtp")
            ) : (
              translate("sendOtp")
            )}
          </button>
        </label>
        <div className="relative">
          <Input
            placeholder={translate("otp6Digit")}
            value={otpCode}
            onChange={(e) => handleOtpChange(e.target.value)}
            maxLength={6}
            className={`w-full h-10 text-sm ${validationErrors.isPhoneVerified ? "border-red-500" : ""}`}
          />
          {isVerifyingOtp && (
            <Loader2 className="absolute right-3 top-2.5 h-5 w-5 animate-spin text-primary" />
          )}
          {isOtpVerified && !isVerifyingOtp && (
            <CheckCircle className="absolute right-3 top-2.5 h-5 w-5 text-green-600" />
          )}
        </div>
        {validationErrors.isPhoneVerified && (
          <p className="text-xs text-red-500 mt-1">{translate("err_isPhoneVerified")}</p>
        )}
      </div>
    </>
  );
}
