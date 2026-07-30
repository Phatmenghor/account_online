"use client";

import React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, UserCheck } from "lucide-react";
import { CustomerInfo } from "../../services/junior-account-service";

interface ParentVerificationSectionProps {
  guardianPhone: string;
  onPhoneChange: (phone: string) => void;
  parentVerified: boolean;
  parentOtpSent: boolean;
  parentOtpCode: string;
  onOtpCodeChange: (code: string) => void;
  parentCountdown: number;
  loading: boolean;
  parentInfo: CustomerInfo | null;
  onSendOtp: () => void;
  error?: string;
}

export function ParentVerificationSection({
  guardianPhone,
  onPhoneChange,
  parentVerified,
  parentOtpSent,
  parentOtpCode,
  onOtpCodeChange,
  parentCountdown,
  loading,
  parentInfo,
  onSendOtp,
  error,
}: ParentVerificationSectionProps) {
  const translate = useTranslations("NIDPage");
  const tJunior = useTranslations("junior");
  const locale = useLocale();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
        <div className="w-1 h-4 rounded-full bg-slate-300 flex-shrink-0" />
        <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700">
          {tJunior("parentVerificationTitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Parent Phone Field */}
        <div className="space-y-1">
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">
              {translate("contactNumber")} <span className="text-red-500 ml-0.5">*</span>
            </label>
            {parentVerified && (
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
            )}
          </div>
          <div className="relative flex items-center">
            <Input
              type="tel"
              placeholder={translate("contactNumber")}
              value={guardianPhone || ""}
              onChange={(e) => onPhoneChange(e.target.value)}
              disabled={parentVerified || loading}
              className="w-full h-10 text-sm rounded-xl pr-32"
            />
            <Button
              type="button"
              onClick={onSendOtp}
              disabled={loading || !guardianPhone || parentVerified || parentCountdown > 0}
              className={`absolute right-1.5 h-7 px-3 text-xs font-bold rounded-lg transition-all ${
                parentVerified
                  ? "bg-teal-50 text-teal-700 border border-teal-200 cursor-default"
                  : loading || !guardianPhone || parentCountdown > 0
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-primary hover:bg-primary/90 text-white shadow-xs cursor-pointer"
              }`}
            >
              {loading ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {translate("processing")}
                </span>
              ) : parentVerified ? (
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5 text-teal-600" />
                  {tJunior("verified")}
                </span>
              ) : parentCountdown > 0 ? (
                `${parentOtpSent ? translate("reSendOtp") : translate("sendOtp")} (${parentCountdown}s)`
              ) : parentOtpSent ? (
                translate("reSendOtp")
              ) : (
                translate("sendOtp")
              )}
            </Button>
          </div>
          {error && <p className="text-xs text-red-500 font-medium mt-1">{error}</p>}
        </div>

        {/* Parent OTP Code Field */}
        <div className="space-y-1">
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">
              {translate("otpCode")} <span className="text-red-500 ml-0.5">*</span>
            </label>
            {parentVerified && (
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
            )}
          </div>
          <div className="relative">
            <Input
              type="text"
              maxLength={6}
              placeholder={translate("otp6Digit")}
              value={parentOtpCode}
              onChange={(e) => onOtpCodeChange(e.target.value.replace(/\D/g, ""))}
              disabled={loading}
              className="w-full h-10 text-sm rounded-xl font-mono tracking-wider pr-10"
            />
            {loading && parentOtpSent && !parentVerified && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-primary pointer-events-none" />
            )}
          </div>
        </div>

        {/* Parent Info Preview */}
        {parentInfo && (
          <div className="md:col-span-2 p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs flex items-center justify-between">
            <div className="font-bold text-teal-800 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-teal-600" />
              <span>
                {tJunior("parentFound")}:{" "}
                {parentInfo.names ? parentInfo.names[0] : "N/A"}
              </span>
            </div>
            <div className="text-slate-600 font-mono">
              CIF: <span className="font-bold text-slate-800">{parentInfo.cif}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
