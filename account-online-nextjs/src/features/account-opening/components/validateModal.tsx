"use client";

import { AlertTriangle, X, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import {
  CustomModal,
  CustomModalHeader,
  CustomModalBody,
  CustomModalFooter,
} from "@/components/shared/modal/custom-modal";

interface ValidationErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  description: string;
}

const ValidationErrorModal = ({
  isOpen,
  onClose,
  title,
  message,
  description,
}: ValidationErrorModalProps) => {
  const translate = useTranslations("NIDPage");

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} size="md">
      {/* Header */}
      <CustomModalHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-200/60 flex items-center justify-center text-red-600 shrink-0 shadow-xs">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
            {title}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </CustomModalHeader>

      {/* Body */}
      <CustomModalBody>
        <div className="bg-red-50/80 border border-red-100/80 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-4.5 h-4.5 text-red-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              {message && <p className="text-sm font-semibold text-red-900">{message}</p>}
              <p className="text-sm text-slate-700 leading-relaxed font-medium">{description}</p>
            </div>
          </div>
        </div>
      </CustomModalBody>

      {/* Footer */}
      <CustomModalFooter>
        <Button
          type="button"
          onClick={onClose}
          className="w-full sm:w-auto h-11 px-6 text-sm font-semibold rounded-2xl bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20 transition-all active:scale-[0.98]"
        >
          {translate("close")}
        </Button>
      </CustomModalFooter>
    </CustomModal>
  );
};

export default ValidationErrorModal;
