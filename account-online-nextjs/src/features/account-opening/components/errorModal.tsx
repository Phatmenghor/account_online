"use client";

import { AlertCircle, X, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

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
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />

          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="relative bg-white w-full max-w-lg sm:max-w-[480px] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden z-10 border border-gray-100 max-h-[90vh] flex flex-col"
          >
            {/* Native Mobile Drag Handle Pill */}
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600 flex-shrink-0">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-gray-900 tracking-tight">
                  {translate("valid_fail")}
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
              <p className="text-sm text-gray-600 leading-relaxed">{translate("not_match")}</p>

              {/* Score card */}
              <div className={`border rounded-xl p-4 ${scoreBg}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{translate("score")}</span>
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
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    {translate("incorrect")}
                  </p>
                  <div className="space-y-2">
                    {data.incorrectFields.map((field, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2.5 bg-white border border-red-100 rounded-lg px-3 py-2 text-sm text-gray-700"
                      >
                        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <span>{getFieldLabel(field)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/80 flex justify-end items-center rounded-b-2xl flex-shrink-0">
              <Button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto h-10 px-6 text-sm font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-sm transition-all"
              >
                {translate("close")}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ErrorModal;
