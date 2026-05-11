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

  // Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  // Validate phone number format (9-15 digits)
  const isValidPhoneNumber = useCallback((phone: string): boolean => {
    const phoneRegex = /^[0-9]{9,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  }, []);

  // Validate single field
  const validateField = useCallback(
    (field: string, value: any, errorMessage?: string) => {
      if (onValidationChange) {
        onValidationChange(field, errorMessage || null);
      }
    },
    [onValidationChange]
  );

  // Handle phone number change
  const handlePhoneChange = (value: string) => {
    // Only allow numeric input
    const numericValue = value.replace(/\D/g, "");
    onPhoneChange(numericValue);

    // Validate phone number
    if (numericValue.trim() === "") {
      validateField("phoneNumber", numericValue, "Phone number is required");
    } else if (!isValidPhoneNumber(numericValue)) {
      validateField(
        "phoneNumber",
        numericValue,
        "Please enter a valid phone number (9-15 digits)"
      );
    } else {
      validateField("phoneNumber", numericValue);
    }

    // Reset OTP states when phone number changes
    if (numericValue !== phoneNumber) {
      setIsOtpSent(false);
      setIsOtpVerified(false);
      setOtpCode("");
      setOtpExpiresAt("");
      setCountdown(0);
      validateField("isPhoneVerified", false, "Phone verification required");
    }
  };

  // Send OTP
  const handleSendOtp = useCallback(async () => {
    if (!phoneNumber.trim()) {
      validateField("phoneNumber", phoneNumber, "Phone number is required");
      AppToast({
        type: "error",
        message: "Phone Number Required",
        description: "Please enter a phone number first",
      });
      return;
    }

    if (!isValidPhoneNumber(phoneNumber)) {
      validateField(
        "phoneNumber",
        phoneNumber,
        "Please enter a valid phone number (9-15 digits)"
      );
      AppToast({
        type: "error",
        message: "Invalid Phone Number",
        description: "Please enter a valid phone number (9-15 digits)",
      });
      return;
    }

    if (countdown > 0) {
      AppToast({
        type: "warning",
        message: "Please Wait",
        description: `You can resend OTP in ${countdown} seconds`,
      });
      return;
    }

    setIsSendingOtp(true);
    try {
      const requestData: SendOtpReq = {
        phone: phoneNumber.replace(/\s/g, ""),
      };

      const response = await SendOtpService(requestData);

      setIsOtpSent(true);
      setOtpExpiresAt(response?.expiresAt ?? "");
      setCountdown(60); // Set countdown to 60 seconds
      setOtpCode(""); // Clear previous OTP

      // Clear phone validation error on successful send
      validateField("phoneNumber", phoneNumber);

      AppToast({
        type: "success",
        message: "OTP Sent Successfully",
        description: `OTP has been sent to ${phoneNumber}`,
      });
    } catch (error: any) {
      console.error("Failed to send OTP:", error);
      validateField(
        "phoneNumber",
        phoneNumber,
        "Failed to send OTP. Please try again"
      );
      AppToast({
        type: "error",
        message: "Failed to Send OTP",
        description:
          error.response?.data?.message || error.message || "Please try again",
      });
      setIsOtpSent(false);
    } finally {
      setIsSendingOtp(false);
    }
  }, [phoneNumber, isValidPhoneNumber, countdown, validateField]);

  // Auto-send OTP when user leaves phone input (blur)
  const handlePhoneBlur = async () => {
    if (!phoneNumber.trim()) return;

    if (isOtpVerified) return; // Don't send if already verified

    if (countdown > 0) return; // Don't send if countdown is active

    if (isValidPhoneNumber(phoneNumber)) {
      await handleSendOtp();
    } else {
      validateField(
        "phoneNumber",
        phoneNumber,
        "Please enter a valid phone number (9-15 digits)"
      );
    }
  };

  // Handle OTP input change
  const handleOtpChange = (value: string) => {
    // Check if phone number is entered first
    if (!phoneNumber.trim()) {
      validateField(
        "phoneNumber",
        phoneNumber,
        "Please enter phone number first"
      );
      AppToast({
        type: "warning",
        message: "Phone Number Required",
        description: "Please enter your phone number before entering OTP",
      });
      return;
    }

    // Only allow numeric input and max 6 digits
    const numericValue = value.replace(/\D/g, "").slice(0, 6);
    setOtpCode(numericValue);

    // Clear OTP validation error when user starts typing (only if phone is valid)
    if (numericValue && phoneNumber.trim()) {
      validateField("isPhoneVerified", false);
    }

    // Reset lastVerifiedOtp when user starts typing new OTP
    if (numericValue.length < 6) {
      setLastVerifiedOtp("");
    }
  };

  // Verify OTP
  const handleVerifyOtp = useCallback(
    async (currentOtpCode: string) => {
      // Check phone number first
      if (!phoneNumber.trim()) {
        validateField(
          "phoneNumber",
          phoneNumber,
          "Please enter phone number first"
        );
        AppToast({
          type: "error",
          message: "Phone Number Required",
          description: "Please enter your phone number first",
        });
        return;
      }

      if (!currentOtpCode.trim()) {
        validateField("isPhoneVerified", false, "OTP code is required");
        AppToast({
          type: "error",
          message: "OTP Required",
          description: "Please enter the OTP code",
        });
        return;
      }

      if (currentOtpCode.length !== 6) {
        validateField("isPhoneVerified", false, "OTP must be 6 digits");
        AppToast({
          type: "error",
          message: "Invalid OTP",
          description: "OTP must be 6 digits",
        });
        return;
      }

      if (!isOtpSent) {
        validateField("isPhoneVerified", false, "Please request an OTP first");
        AppToast({
          type: "error",
          message: "OTP Not Sent",
          description: "Please request an OTP first",
        });
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
          setCountdown(0); // Stop countdown on success
          setLastVerifiedOtp(currentOtpCode); // Mark this OTP as verified

          // Clear validation error on success
          validateField("isPhoneVerified", true);

          AppToast({
            type: "success",
            message: "OTP Verified Successfully",
            description: "Your phone number has been verified",
          });

          // Call success callback if provided
          if (onVerificationSuccess) {
            onVerificationSuccess();
          }
        } else {
          // DON'T clear OTP - let user see what they entered
          setLastVerifiedOtp(currentOtpCode); // Mark this OTP as already checked
          validateField(
            "isPhoneVerified",
            false,
            "Invalid OTP code. Please delete and try again"
          );
          AppToast({
            type: "error",
            message: "Verification Failed",
            description:
              response.message ||
              "Invalid OTP code. Please delete and try again",
          });
        }
      } catch (error: any) {
        console.error("Failed to verify OTP:", error);
        // DON'T clear OTP - let user see what they entered
        setLastVerifiedOtp(currentOtpCode); // Mark this OTP as already checked
        const errorMsg =
          error.response?.data?.message ||
          "Invalid OTP code. Please delete and try again";
        validateField("isPhoneVerified", false, errorMsg);
        AppToast({
          type: "error",
          message: "Verification Failed",
          description: errorMsg,
        });
        setIsOtpVerified(false);
      } finally {
        setIsVerifyingOtp(false);
      }
    },
    [isOtpSent, phoneNumber, onVerificationSuccess, validateField]
  );

  // Auto-verify when OTP reaches 6 digits - ONLY ONCE per unique OTP
  useEffect(() => {
    if (
      phoneNumber.trim() &&
      otpCode.length === 6 &&
      /^\d{6}$/.test(otpCode) &&
      !isOtpVerified &&
      !isVerifyingOtp &&
      otpCode !== lastVerifiedOtp // Only verify if this OTP hasn't been checked yet
    ) {
      handleVerifyOtp(otpCode);
    }
  }, [
    otpCode,
    phoneNumber,
    isOtpVerified,
    isVerifyingOtp,
    lastVerifiedOtp,
    handleVerifyOtp,
  ]);

  // Reset function (can be called from parent)
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
          {isOtpVerified && (
            <span className="float-right text-green-600 text-sm flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Verified
            </span>
          )}
        </label>
        <div className="relative">
          <Input
            placeholder={translate("contactNumber")}
            value={phoneNumber}
            onChange={(e) => handlePhoneChange(e.target.value)}
            onBlur={handlePhoneBlur}
            className={`w-full h-10 text-sm ${
              validationErrors.phoneNumber ? "border-red-500" : ""
            }`}
            disabled={disabled || isSendingOtp}
            maxLength={15}
          />
          {isSendingOtp && (
            <Loader2 className="absolute right-3 top-2.5 h-5 w-5 animate-spin text-blue-600" />
          )}
          {isOtpVerified && !isSendingOtp && (
            <CheckCircle className="absolute right-3 top-2.5 h-5 w-5 text-green-600" />
          )}
        </div>
        {validationErrors.phoneNumber && (
          <p className="text-xs text-red-500 mt-1">
            {translate("err_phoneNumber_regex")}
          </p>
        )}
      </div>

      {/* OTP Code */}
      <div>
        <label className="text-sm sm:text-base font-medium text-gray-700 block mb-1">
          {translate("otpCode")}
          <button
            type="button"
            onClick={handleSendOtp}
            className={`float-right text-sm border-b-2 transition-colors ${
              countdown > 0
                ? "text-gray-400 border-gray-400 cursor-not-allowed"
                : "text-blue-600 border-blue-600 hover:text-blue-700 hover:border-blue-700 cursor-pointer"
            }`}
            disabled={countdown > 0}
          >
            {countdown > 0
              ? `${isOtpSent ? "Resend" : translate("sendOtp")} (${countdown}s)`
              : isOtpSent
              ? translate("reSendOtp")
              : translate("sendOtp")}
          </button>
        </label>
        <div className="relative">
          <Input
            placeholder={translate("otp6Digit")}
            value={otpCode}
            onChange={(e) => handleOtpChange(e.target.value)}
            maxLength={6}
            className={`w-full h-10 text-sm ${
              validationErrors.isPhoneVerified ? "border-red-500" : ""
            }`}
          />
          {isVerifyingOtp && (
            <Loader2 className="absolute right-3 top-2.5 h-5 w-5 animate-spin text-blue-600" />
          )}
          {isOtpVerified && !isVerifyingOtp && (
            <CheckCircle className="absolute right-3 top-2.5 h-5 w-5 text-green-600" />
          )}
        </div>
        {validationErrors.isPhoneVerified && (
          <p className="text-xs text-red-500 mt-1">
            {translate("err_isPhoneVerified")}
          </p>
        )}
      </div>
    </>
  );
}
