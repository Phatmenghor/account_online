"use client";

import { AlertTriangle, X, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

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

          {/* Modal Container */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="relative bg-white w-full max-w-lg sm:max-w-[480px] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden z-10 border border-gray-100 max-h-[90vh] flex flex-col"
          >
            {/* Primary Top Accent */}
            <div className="h-1.5 w-full bg-red-500 flex-shrink-0" />

            {/* Native Mobile Drag Handle Pill */}
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto my-2 sm:hidden shrink-0" />
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600 flex-shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-gray-900 tracking-tight">{title}</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="bg-red-50/80 border border-red-100 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4.5 h-4.5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-red-900">{message}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/80 flex justify-end items-center rounded-b-2xl">
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

export default ValidationErrorModal;
