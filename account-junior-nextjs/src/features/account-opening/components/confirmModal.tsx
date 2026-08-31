"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { ShieldCheck, X } from "lucide-react";
import {
  CustomModal,
  CustomModalHeader,
  CustomModalBody,
  CustomModalFooter,
} from "@/components/shared/modal/custom-modal";

interface ConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
}

const ConfirmationModal = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
}: ConfirmationModalProps) => {
  const translate = useTranslations("common");

  return (
    <CustomModal isOpen={isOpen} onClose={onCancel} size="md">
      {/* Header */}
      <CustomModalHeader>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
            {title || translate("cfTitle")}
          </h3>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </CustomModalHeader>

      {/* Body */}
      <CustomModalBody>
        <p className="text-sm text-slate-600 leading-relaxed font-normal">
          {message || translate("cfMessage")}
        </p>
      </CustomModalBody>

      {/* Footer */}
      <CustomModalFooter>
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="w-full sm:w-auto h-10 px-5 text-sm font-medium rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all"
        >
          {translate("noIneed")}
        </Button>
        <Button
          type="button"
          onClick={onConfirm}
          className="w-full sm:w-auto h-10 px-6 text-sm font-semibold rounded-xl bg-primary hover:bg-primary/90 text-white shadow-sm transition-all"
        >
          {translate("yesIhave")}
        </Button>
      </CustomModalFooter>
    </CustomModal>
  );
};

export default ConfirmationModal;
