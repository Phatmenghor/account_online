"use client";

import React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";

interface JuniorPhoneVerificationSectionProps {
  phoneNumber: string;
  onPhoneChange: (phone: string) => void;
  juniorVerified: boolean;
  juniorOtpSent: boolean;
  juniorOtpCode: string;
  onOtpCodeChange: (code: string) => void;
  juniorCountdown: number;
  loading: boolean;
  onSendOtp: () => void;
  error?: string;
}

export function JuniorPhoneVerificationSection({
  phoneNumber,
  onPhoneChange,
  juniorVerified,
  juniorOtpSent,
  juniorOtpCode,
  onOtpCodeChange,
  juniorCountdown,
  loading,
  onSendOtp,
  error,
}: JuniorPhoneVerificationSectionProps) {
  const translate = useTranslations("NIDPage");
  const tJunior = useTranslations("junior");
  const locale = useLocale();

  const handlePhoneBlur = () => {
    if (!phoneNumber || juniorVerified || juniorOtpSent || loading || juniorCountdown > 0) return;
    const clean = phoneNumber.replace(/\D/g, "");
    if (clean.length >= 8 && clean.length <= 15) {
      onSendOtp();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
        <div className="w-1 h-4 rounded-full bg-slate-300 flex-shrink-0" />
        <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700">
          {tJunior("juniorPhoneVerificationTitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Junior Phone Field */}
        <div className="space-y-1">
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">
              {translate("contactNumber")} <span className="text-red-500 ml-0.5">*</span>
            </label>
            {juniorVerified && (
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
            )}
          </div>
          <div className="relative flex items-center">
            <Input
              type="tel"
              placeholder={translate("contactNumber")}
              value={phoneNumber || ""}
              onChange={(e) => onPhoneChange(e.target.value)}
              onBlur={handlePhoneBlur}
              disabled={juniorVerified || loading}
              className="w-full h-10 text-sm rounded-xl pr-32"
            />
            <Button
              type="button"
              onClick={onSendOtp}
              disabled={loading || !phoneNumber || juniorVerified || juniorCountdown > 0}
              className={`absolute right-1.5 h-7 px-3 text-xs font-bold rounded-lg transition-all ${
                juniorVerified
                  ? "bg-teal-50 text-teal-700 border border-teal-200 cursor-default"
                  : loading || !phoneNumber || juniorCountdown > 0
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-primary hover:bg-primary/90 text-white shadow-xs cursor-pointer"
              }`}
            >
              {loading ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {translate("processing")}
                </span>
              ) : juniorVerified ? (
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5 text-teal-600" />
                  {tJunior("verified")}
                </span>
              ) : juniorCountdown > 0 ? (
                `${juniorOtpSent ? translate("reSendOtp") : translate("sendOtp")} (${juniorCountdown}s)`
              ) : juniorOtpSent ? (
                translate("reSendOtp")
              ) : (
                translate("sendOtp")
              )}
            </Button>
          </div>
          {error && <p className="text-xs text-red-500 font-medium mt-1">{error}</p>}
        </div>

        {/* Junior OTP Code Field */}
        <div className="space-y-1">
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">
              {translate("otpCode")} <span className="text-red-500 ml-0.5">*</span>
            </label>
            {juniorVerified && (
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
            )}
          </div>
          <div className="relative">
            <Input
              type="text"
              maxLength={6}
              placeholder={translate("otp6Digit")}
              value={juniorOtpCode}
              onChange={(e) => onOtpCodeChange(e.target.value.replace(/\D/g, ""))}
              disabled={juniorVerified || loading}
              className="w-full h-10 text-sm rounded-xl font-mono tracking-wider pr-10"
            />
            {loading && juniorOtpSent && !juniorVerified && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-primary pointer-events-none" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
