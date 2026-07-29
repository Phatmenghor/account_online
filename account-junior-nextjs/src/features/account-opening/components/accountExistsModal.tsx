"use client";

import { Wallet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

interface AccountExistsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: {
    cif?: string;
    accountNumber?: string;
    accountName?: string;
    message?: string;
  } | null;
}

const AccountExistsModal = ({
  isOpen,
  onClose,
  data,
}: AccountExistsModalProps) => {
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
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />

          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="relative bg-white w-full max-w-lg sm:max-w-[480px] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden z-10 border border-gray-100 max-h-[90vh] flex flex-col"
          >
            {/* Primary Top Accent */}
            <div className="h-1.5 w-full bg-primary flex-shrink-0" />

            {/* Native Mobile Drag Handle Pill */}
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto my-2 sm:hidden shrink-0" />

            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center text-primary flex-shrink-0">
                  <Wallet className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 tracking-tight">
                    គណនីរបស់អ្នកមាន
                  </h3>
                  <p className="text-xs text-primary font-medium">Account Exists</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Scrollable Body - Single Unified Card */}
            <div className="px-6 py-5 overflow-y-auto flex-1">
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 space-y-4">
                <p className="text-sm font-medium text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {data?.message ||
                    "លោកអ្នកមានគណនីជាមួយធនាគាររួចហើយ។ សូមប្រើប្រាស់ជាមួយគណនីរបស់លោកអ្នក។"}
                </p>

                <div className="pt-3 border-t border-primary/15 text-xs text-gray-600 space-y-1">
                  <p className="font-semibold text-gray-700">ទំនាក់ទំនងគាំទ្រ៖ 070 200 002 | 1800 200 888</p>
                  <p className="text-gray-500">info@cambodiapostbank.com.kh</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/80 flex justify-end items-center rounded-b-2xl flex-shrink-0">
              <Button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto h-10 px-6 text-sm font-semibold rounded-xl bg-primary hover:bg-primary/90 text-white shadow-sm transition-all"
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

export default AccountExistsModal;
