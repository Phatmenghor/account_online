"use client";

import React from "react";
import { X } from "lucide-react";

interface ProfilePhotoModalProps {
  profileImageUrl: string;
  showPhotoPreview: boolean;
  editMode: boolean;
  fullName?: string;
  handleClosePreview: () => void;
  handlePreviewMouseEnter: () => void;
  handlePhotoMouseLeave: () => void;
}

export function ProfilePhotoModal({
  profileImageUrl,
  showPhotoPreview,
  editMode,
  fullName,
  handleClosePreview,
  handlePreviewMouseEnter,
  handlePhotoMouseLeave,
}: ProfilePhotoModalProps) {
  if (!profileImageUrl || !showPhotoPreview || editMode) return null;

  return (
    <>
      {/* Modern backdrop blur overlay */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[9998] animate-in fade-in duration-200"
        onMouseEnter={handlePreviewMouseEnter}
        onClick={handleClosePreview}
      />

      {/* Centered Modal Content with sleek borders */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] animate-in zoom-in-95 fade-in duration-200"
        onMouseEnter={handlePreviewMouseEnter}
        onMouseLeave={handlePhotoMouseLeave}
      >
        <div className="relative bg-white p-4 rounded-3xl shadow-2xl border border-white/40 max-w-md w-full">
          {/* Close Button */}
          <button
            onClick={handleClosePreview}
            className="absolute -top-3 -right-3 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-2 shadow-lg transition-transform hover:scale-110 z-10 focus:outline-none"
            aria-label="Close photo preview"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="overflow-hidden rounded-2xl bg-slate-900/5">
            <img
              src={profileImageUrl}
              alt={fullName || "Profile"}
              className="max-w-[75vw] max-h-[65vh] w-auto h-auto object-contain rounded-2xl mx-auto"
            />
          </div>

          {fullName && (
            <p className="text-base font-bold text-center mt-3.5 text-slate-900">
              {fullName}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
