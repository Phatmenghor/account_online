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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.97 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-white w-full sm:max-w-[520px] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
          >
            <div className="h-1.5 w-full bg-gradient-to-r from-red-400 via-red-500 to-rose-500 flex-shrink-0" />

            <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-red-400 to-rose-600 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                  <AlertCircle style={{ width: 18, height: 18 }} className="text-white" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-gray-800">
                  {translate("valid_fail")}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 pb-5 space-y-3 overflow-y-auto flex-1">
              <p className="text-sm text-gray-500 leading-relaxed">{translate("not_match")}</p>

              {/* Score card */}
              <div className={`border rounded-2xl p-3.5 ${scoreBg}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">{translate("score")}</span>
                  <span className={`text-lg font-bold ${scoreColor}`}>{scorePercent}%</span>
                </div>
                <div className="h-2 bg-white/60 rounded overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${scorePercent}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                    className={`h-full rounded ${
                      scorePercent >= 70 ? "bg-amber-500" : scorePercent >= 40 ? "bg-orange-500" : "bg-red-500"
                    }`}
                  />
                </div>
              </div>

              {data?.incorrectFields && data.incorrectFields.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">
                    {translate("incorrect")}
                  </p>
                  <div className="space-y-1.5">
                    {data.incorrectFields.map((field, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.08 * index }}
                        className="flex items-center gap-2.5 bg-white border border-red-100 rounded-lg px-3 py-2"
                      >
                        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{getFieldLabel(field)}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold py-2.5 rounded-lg shadow-sm transition-all"
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
