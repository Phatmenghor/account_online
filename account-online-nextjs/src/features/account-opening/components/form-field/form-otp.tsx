"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Loader2, CheckCircle } from "lucide-react";
import { AppToast } from "@/components/shared/toast/app-toast";
import {
  checkPhoneService,
  sendOtpService,
  verifiedOtpService,
  type PhoneCheckResult,
} from "@/features/account-opening/services/otp.service";
import { Button } from "@/components/ui/button";
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
  const locale = useLocale();
  const [otpCode, setOtpCode] = useState<string>("");
  const [isOtpSent, setIsOtpSent] = useState<boolean>(false);
  const [isOtpVerified, setIsOtpVerified] = useState<boolean>(false);
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);
  const [otpExpiresAt, setOtpExpiresAt] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(0);
  const [lastVerifiedOtp, setLastVerifiedOtp] = useState<string>("");
  // Phone pre-check warning
  const [phoneWarning, setPhoneWarning] = useState<PhoneCheckResult | null>(null);
  const [showPhoneWarning, setShowPhoneWarning] = useState(false);

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
        description: translate("otp_resend_wait", { n: countdown }),
      });
      return;
    }

    setIsSendingOtp(true);
    try {
      // ── Step 1: Pre-check phone against MB Core ──
      try {
        const check = await checkPhoneService(phoneNumber.replace(/\s/g, ""));
        if (check.hasAccount) {
          setPhoneWarning(check);
          setShowPhoneWarning(true);
          setIsSendingOtp(false);
          return; // stop here — user must dismiss the warning first
        }
      } catch {
        // If pre-check fails (network/server issue), continue with OTP send
      }

      // ── Step 2: Send OTP ──
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
      <div className="space-y-1">
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-gray-700">
            {translate("contactNumber")}
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
            onBlur={handlePhoneBlur}
            className={`w-full h-9 text-sm rounded-xl pr-28 ${validationErrors.phoneNumber ? "border-red-400" : ""}`}
            disabled={disabled || isSendingOtp || isOtpVerified}
            maxLength={15}
          />
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={countdown > 0 || disabled || isSendingOtp || isOtpVerified}
            className={`absolute right-1 text-xs px-3 h-7 rounded-lg font-semibold shadow-xs transition-all duration-200 ${
              countdown > 0 || disabled || isSendingOtp || isOtpVerified
                ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                : "bg-primary hover:bg-primary/90 text-white cursor-pointer"
            }`}
          >
            {isSendingOtp ? (
              <span className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                {translate("loading")}
              </span>
            ) : countdown > 0 ? (
              `ផ្ញើ OTP (${countdown}s)`
            ) : isOtpSent ? (
              translate("reSendOtp")
            ) : (
              "ផ្ញើ OTP"
            )}
          </button>
        </div>
        {validationErrors.phoneNumber && (
          <p className="text-xs text-red-500 mt-1">{translate("err_phoneNumber_regex")}</p>
        )}
      </div>

      {/* OTP Code */}
      <div className="space-y-1">
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-gray-700">
            {translate("otpCode")}
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
            className={`w-full h-9 text-sm rounded-xl ${validationErrors.isPhoneVerified ? "border-red-400" : ""}`}
          />
          {isVerifyingOtp && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-primary pointer-events-none" />
          )}
        </div>
        {validationErrors.isPhoneVerified && (
          <p className="text-xs text-red-500 mt-1">{translate("err_isPhoneVerified")}</p>
        )}
      </div>

      {/* ── Phone Already Registered Warning Modal ── */}
      {showPhoneWarning && phoneWarning && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
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
                onClick={() => setShowPhoneWarning(false)}
                className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-xl cursor-pointer"
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


