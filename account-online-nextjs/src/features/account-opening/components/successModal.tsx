"use client";

import { CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import {
  CustomModal,
  CustomModalHeader,
  CustomModalBody,
  CustomModalFooter,
} from "@/components/shared/modal/custom-modal";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: { score: number; incorrectFields: string[] } | null;
}

const SuccessModal = ({ isOpen, onClose, data }: SuccessModalProps) => {
  const translate = useTranslations("NIDPage");

  const getFieldLabel = (field: string) => {
    const fieldLabels: { [key: string]: string } = {
      lastNameEn: translate("lnameEn"),
      firstNameEn: translate("fnameEn"),
      dob: translate("dob"),
      firstNameKh: translate("fnameKH"),
      lastNameKh: translate("lnameKH"),
      gender: translate("gender"),
      expiredDate: translate("exp"),
      issuedDate: translate("issued"),
    };
    return fieldLabels[field] || field;
  };

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} size="md">
      {/* Header */}
      <CustomModalHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600 shrink-0 shadow-xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-emerald-700 tracking-tight leading-tight">
            {translate("valid_success")}
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
        <p className="text-sm text-slate-600 leading-relaxed font-normal">{translate("completed")}</p>
        <div className="bg-emerald-50/80 border border-emerald-200/70 text-slate-700 p-4 rounded-2xl space-y-2">
          <p className="text-sm">
            <strong className="font-semibold text-slate-900">{translate("score")}:</strong> {(data?.score || 0) * 100}%
          </p>
          {data?.incorrectFields && data.incorrectFields.length > 0 && (
            <>
              <p className="text-sm font-semibold text-amber-700 pt-1">
                {translate("warning")}
              </p>
              <ul className="list-disc list-inside text-sm text-amber-800 space-y-0.5">
                {data.incorrectFields.map((field, index) => (
                  <li key={index}>{getFieldLabel(field)}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      </CustomModalBody>

      {/* Footer */}
      <CustomModalFooter>
        <Button
          type="button"
          onClick={onClose}
          className="w-full sm:w-auto h-11 px-6 text-sm font-semibold rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 transition-all active:scale-[0.98]"
        >
          {translate("close")}
        </Button>
      </CustomModalFooter>
    </CustomModal>
  );
};

export default SuccessModal;
