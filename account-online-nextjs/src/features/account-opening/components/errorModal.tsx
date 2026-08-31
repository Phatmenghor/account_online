"use client";

import { AlertCircle, X, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import {
  CustomModal,
  CustomModalHeader,
  CustomModalBody,
  CustomModalFooter,
} from "@/components/shared/modal/custom-modal";

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: { score: number; incorrectFields: string[] } | null;
}

const ErrorModal = ({ isOpen, onClose, data }: ErrorModalProps) => {
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

  const scorePercent = Math.round((data?.score || 0) * 100);
  const scoreColor =
    scorePercent >= 70 ? "text-amber-600" : scorePercent >= 40 ? "text-orange-600" : "text-red-600";
  const scoreBg =
    scorePercent >= 70 ? "bg-amber-50 border-amber-200" : scorePercent >= 40 ? "bg-orange-50 border-orange-200" : "bg-red-50 border-red-200";

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} size="md">
      {/* Header */}
      <CustomModalHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-200/60 flex items-center justify-center text-red-600 shrink-0 shadow-xs">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
            {translate("valid_fail")}
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
        <p className="text-sm text-slate-600 leading-relaxed font-normal">{translate("not_match")}</p>

        {/* Score card */}
        <div className={`border rounded-2xl p-4 ${scoreBg}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">{translate("score")}</span>
            <span className={`text-base font-bold ${scoreColor}`}>{scorePercent}%</span>
          </div>
          <div className="h-2 bg-white/80 rounded-full overflow-hidden">
            <div
              style={{ width: `${scorePercent}%` }}
              className={`h-full rounded-full transition-all duration-500 ${
                scorePercent >= 70 ? "bg-amber-500" : scorePercent >= 40 ? "bg-orange-500" : "bg-red-500"
              }`}
            />
          </div>
        </div>

        {data?.incorrectFields && data.incorrectFields.length > 0 && (
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              {translate("incorrect")}
            </p>
            <div className="flex flex-wrap gap-2">
              {data.incorrectFields.map((field) => (
                <span
                  key={field}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-200/80 rounded-xl text-xs font-medium text-red-700"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  {getFieldLabel(field)}
                </span>
              ))}
            </div>
          </div>
        )}
      </CustomModalBody>

      {/* Footer */}
      <CustomModalFooter>
        <Button
          type="button"
          onClick={onClose}
          className="w-full sm:w-auto h-11 px-6 text-sm font-semibold rounded-2xl bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20 transition-all active:scale-[0.98]"
        >
          {translate("try_again")}
        </Button>
      </CustomModalFooter>
    </CustomModal>
  );
};

export default ErrorModal;
