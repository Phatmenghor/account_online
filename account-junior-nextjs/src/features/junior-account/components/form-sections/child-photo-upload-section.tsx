"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { Camera } from "lucide-react";

interface ChildPhotoUploadSectionProps {
  selfiePreview?: string | null;
  selfieFileName?: string;
  onSelfieUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

export function ChildPhotoUploadSection({
  selfiePreview,
  selfieFileName,
  onSelfieUpload,
  error,
}: ChildPhotoUploadSectionProps) {
  const tJunior = useTranslations("junior");

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-slate-700 block">
        {tJunior("childFacePhoto")} <span className="text-red-500 ml-0.5">*</span>
      </Label>
      <label
        htmlFor="child-selfie-upload-input"
        className={`group relative flex flex-col items-center justify-center h-36 sm:h-40 rounded-2xl border-2 border-dashed cursor-pointer overflow-hidden transition-all duration-200 ${
          selfiePreview
            ? "border-emerald-500/50 bg-emerald-50/20 hover:border-emerald-500"
            : "border-slate-200 bg-slate-50/50 hover:border-primary hover:bg-primary/5"
        }`}
      >
        {selfiePreview ? (
          <>
            <img src={selfiePreview} alt="Child Face Photo" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-white text-xs font-semibold gap-2">
              <Camera className="w-4 h-4" />
              <span>{tJunior("changePhoto")}</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center p-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">
                {selfieFileName || tJunior("clickToTakeUploadPhoto")}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">JPG, PNG, WEBP (Max 10MB)</p>
            </div>
          </div>
        )}
        <input
          type="file"
          id="child-selfie-upload-input"
          accept="image/*"
          onChange={onSelfieUpload}
          className="hidden"
        />
      </label>
      {error && <p className="text-xs text-red-500 font-medium mt-1">{error}</p>}
    </div>
  );
}
