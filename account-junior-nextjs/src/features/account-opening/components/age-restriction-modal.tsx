"use client";

import React from "react";
import { UserX } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface AgeRestrictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** 'junior' = user is >= 18 on Junior account; 'adult' = user is < 18 on Adult account */
  mode: "junior" | "adult";
  calculatedAge?: number | null;
}

export function AgeRestrictionModal({
  isOpen,
  onClose,
  mode,
  calculatedAge,
}: AgeRestrictionModalProps) {
  if (!isOpen) return null;

  const isJuniorMode = mode === "junior";

  const titleKh = isJuniorMode
    ? "មិនអាចបង្កើតគណនី Junior បានទេ"
    : "មិនអាចបង្កើតគណនីមនុស្សពេញវ័យបានទេ";

  const titleEn = isJuniorMode
    ? "Cannot Open Junior Account"
    : "Cannot Open Adult Account";

  const messageKh = isJuniorMode
    ? `លោកអ្នកមានអាយុចាប់ពី ១៨ ឆ្នាំឡើងទៅ ${
        calculatedAge !== null && calculatedAge !== undefined ? `(អាយុបច្ចុប្បន្ន: ${calculatedAge} ឆ្នាំ)` : ""
      } មិនអាចបង្កើតគណនី CPBank Junior Savings បានទេ។ សូមស្នើសុំបង្កើតគណនីតាមប្រព័ន្ធ Account Online (មនុស្សពេញវ័យ)។`
    : `លោកអ្នកមានអាយុក្រោម ១៨ ឆ្នាំ ${
        calculatedAge !== null && calculatedAge !== undefined ? `(អាយុបច្ចុប្បន្ន: ${calculatedAge} ឆ្នាំ)` : ""
      } មិនអាចបង្កើតគណនីមនុស្សពេញវ័យបានទេ។ សូមស្នើសុំបង្កើតគណនី CPBank Junior Savings។`;

  const messageEn = isJuniorMode
    ? `You are 18 years of age or older ${
        calculatedAge !== null && calculatedAge !== undefined ? `(Current Age: ${calculatedAge})` : ""
      } and cannot open a CPBank Junior Savings account. Please apply for an Account Online (Adult) instead.`
    : `You are under 18 years old ${
        calculatedAge !== null && calculatedAge !== undefined ? `(Current Age: ${calculatedAge})` : ""
      } and cannot open an Adult Account. Please apply for a CPBank Junior Savings account instead.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative bg-white border border-slate-200 w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center overflow-hidden">
        {/* Header Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
          <UserX className="w-8 h-8" />
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
            {titleKh}
          </h3>
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
            {titleEn}
          </p>
        </div>

        {/* Message Box */}
        <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 text-left space-y-3">
          <p className="text-sm text-slate-800 font-medium leading-relaxed">
            {messageKh}
          </p>
          <div className="border-t border-slate-200 pt-2.5">
            <p className="text-xs text-slate-600 leading-relaxed italic">
              {messageEn}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Button
            type="button"
            onClick={onClose}
            className="w-full h-12 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-600/20 transition-all flex items-center justify-center gap-2"
          >
            <span>យល់ព្រម / Understood</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
