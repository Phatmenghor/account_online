"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, CheckCircle, XCircle } from "lucide-react";

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
  title = "Confirm Information",
  message = "Please confirm that you have reviewed your personal information.",
}: ConfirmationModalProps) => {
  const translate = useTranslations("common");

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="relative bg-white w-full max-w-[480px] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden z-10 border border-gray-100 max-h-[90vh] flex flex-col"
          >
            {/* Native Mobile Drag Handle Pill */}
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-gray-900 tracking-tight">{title}</h3>
              </div>
              <button
                type="button"
                onClick={onCancel}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <XCircle className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 text-center sm:text-left">
              <p className="text-sm text-gray-600 leading-relaxed">
                {message}
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/80 flex flex-col sm:flex-row justify-end items-center gap-3 rounded-b-2xl">
              <Button
                type="button"
                onClick={onCancel}
                variant="outline"
                className="w-full sm:w-auto h-10 px-5 text-sm font-medium rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {translate("noIneed")}
              </Button>
              <Button
                type="button"
                onClick={onConfirm}
                className="w-full sm:w-auto h-10 px-6 text-sm font-semibold rounded-xl bg-primary hover:bg-primary/90 text-white shadow-sm flex items-center justify-center gap-1.5 transition-all"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{translate("yesIhave")}</span>
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;
