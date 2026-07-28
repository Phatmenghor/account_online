"use client";

import React from "react";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { AlertTriangle, XCircle } from "lucide-react";

interface WarningAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: "warning" | "error";
}

export function WarningAlertModal({
  isOpen,
  onClose,
  title,
  message,
  type = "warning",
}: WarningAlertModalProps) {
  const locale = useLocale();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative bg-white border border-slate-200 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 text-center">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
            type === "warning"
              ? "bg-amber-100 border border-amber-200 text-amber-600"
              : "bg-red-100 border border-red-200 text-red-600"
          }`}
        >
          {type === "warning" ? (
            <AlertTriangle className="w-6 h-6" />
          ) : (
            <XCircle className="w-6 h-6" />
          )}
        </div>

        <h3 className="text-base font-bold text-slate-900">{title}</h3>

        <p className="text-xs text-slate-600 leading-relaxed text-left bg-slate-50 p-4 rounded-xl border border-slate-200">
          {message}
        </p>

        <div className="pt-2">
          <Button
            type="button"
            onClick={onClose}
            className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-xl"
          >
            {locale === "kh" ? "យល់ព្រម" : "OK"}
          </Button>
        </div>
      </div>
    </div>
  );
}
