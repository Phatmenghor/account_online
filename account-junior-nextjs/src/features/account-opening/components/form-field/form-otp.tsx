"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { AppToast } from "@/components/shared/toast/app-toast";
import { sendOtpService, verifiedOtpService } from "@/features/account-opening/services/otp.service";
import { checkPhone } from "@/features/junior-account/services/junior-account-service";
import { SendOtpReq, VerifyOtpReq } from "@/features/account-opening/types/otp.request";
import { useTranslations, useLocale } from "next-intl";

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

  const [phoneRegisteredModal, setPhoneRegisteredModal] = useState<boolean>(false);
  const translate = useTranslations("NIDPage");
  const locale = useLocale();

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
        description: translate("otp_resend_wait", { n: countdown }),
      });
      return;
    }

    setIsSendingOtp(true);
    try {
      // Pre-check if phone number is ALREADY registered with CPBank Mobile Banking
      const checkRes = await checkPhone(phoneNumber.replace(/\s/g, ""));
      if (checkRes.hasAccount) {
        setPhoneRegisteredModal(true);
        setIsSendingOtp(false);
        return;
      }

      const requestData: SendOtpReq = { phone: phoneNumber.replace(/\s/g, "") };
      const response = await sendOtpService(requestData);

      setIsOtpSent(true);
      setOtpExpiresAt(response?.expiresAt ?? "");
      setCountdown(60);
      setOtpCode("");
      validateField("phoneNumber", phoneNumber);

      AppToast({
        type: "success",
        message: translate("otp_sent_success"),
        description: translate("otp_sent_success_desc", { phone: phoneNumber }),
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

        const response = await verifiedOtpService(requestData);

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

  // Auto-verify when 6 digits are typed
  useEffect(() => {
    if (
      phoneNumber.trim() &&
      otpCode.length === 6 &&
      /^\d{6}$/.test(otpCode) &&
      !isOtpVerified &&
      !isVerifyingOtp &&
      isOtpSent &&
      otpCode !== lastVerifiedOtp
    ) {
      handleVerifyOtp(otpCode);
    }
  }, [otpCode, phoneNumber, isOtpVerified, isVerifyingOtp, isOtpSent, lastVerifiedOtp, handleVerifyOtp]);

  // Auto-clear verified status on reset or empty phone number
  useEffect(() => {
    if (reset || !phoneNumber) {
      setOtpCode("");
      setIsOtpSent(false);
      setIsOtpVerified(false);
      setCountdown(0);
      setLastVerifiedOtp("");
    }
  }, [reset, phoneNumber]);

  return (
    <>
      {/* Contact Number */}
      <div className="space-y-1">
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-gray-700">
            {translate("contactNumber")} <span className="text-red-500 ml-0.5">*</span>
          </label>
          {isOtpVerified && (
            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
          )}
        </div>
        <div className="relative flex items-center">
          <Input
            placeholder={translate("contactNumber")}
            value={phoneNumber}
            onChange={(e) => handlePhoneChange(e.target.value)}
            className={`w-full h-10 text-sm rounded-xl pr-28 ${validationErrors.phoneNumber ? "border-red-400" : ""}`}
            disabled={disabled || isSendingOtp}
            maxLength={15}
          />
          <Button
            type="button"
            onClick={handleSendOtp}
            disabled={countdown > 0 || disabled || isSendingOtp || isOtpVerified || !phoneNumber}
            className={`absolute right-1.5 h-7 px-3 text-xs font-bold rounded-lg transition-all ${
              countdown > 0 || disabled || isSendingOtp || isOtpVerified || !phoneNumber
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-primary hover:bg-primary/90 text-white shadow-xs cursor-pointer"
            }`}
          >
            {isSendingOtp ? (
              <span className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                {translate("loading")}
              </span>
            ) : countdown > 0 ? (
              `${isOtpSent ? translate("reSendOtp") : translate("sendOtp")} (${countdown}s)`
            ) : isOtpSent ? (
              translate("reSendOtp")
            ) : (
              translate("sendOtp")
            )}
          </Button>
        </div>
        {validationErrors.phoneNumber && (
          <p className="text-xs text-red-500 mt-1">{translate("err_phoneNumber_regex")}</p>
        )}
      </div>

      {/* OTP Code with Auto-verify on 6 digits typed */}
      <div className="space-y-1">
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-gray-700">
            {translate("otpCode")} <span className="text-red-500 ml-0.5">*</span>
          </label>
          {isOtpVerified && (
            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
          )}
        </div>
        <div className="relative">
          <Input
            placeholder={translate("otp6Digit")}
            value={otpCode}
            onChange={(e) => handleOtpChange(e.target.value)}
            maxLength={6}
            disabled={disabled || isOtpVerified}
            className={`w-full h-10 text-sm rounded-xl font-mono tracking-wider ${validationErrors.isPhoneVerified ? "border-red-400" : ""}`}
          />
          {isVerifyingOtp && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-primary pointer-events-none" />
          )}
        </div>
        {validationErrors.isPhoneVerified && (
          <p className="text-xs text-red-500 mt-1">{translate("err_isPhoneVerified")}</p>
        )}
      </div>

      {/* PHONE ALREADY REGISTERED WARNING MODAL */}
      {phoneRegisteredModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative bg-white border border-slate-200 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900">
              {translate("account_exists_title")}
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed text-left bg-slate-50 p-4 rounded-xl border border-slate-200">
              {translate("account_exists_message")}
            </p>

            <div className="pt-2">
              <Button
                type="button"
                onClick={() => setPhoneRegisteredModal(false)}
                className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-xl"
              >
                {locale === "kh" ? "យល់ព្រម" : "OK"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
