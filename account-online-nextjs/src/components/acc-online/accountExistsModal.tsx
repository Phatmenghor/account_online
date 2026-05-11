"use client";

import { Wallet, X, ArrowRight } from "lucide-react";
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
  onContinue?: () => void;
}

const AccountExistsModal = ({
  isOpen,
  onClose,
  data,
  onContinue,
}: AccountExistsModalProps) => {
  const translate = useTranslations("common");

  const handleContinue = () => {
    onContinue?.();
    onClose();
  };

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
            className="relative bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
          >
            {/* Top accent bar - Primary color */}
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 flex-shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                  <Wallet style={{ width: 20, height: 20 }} className="text-white" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-800">
                    គណនីរបស់អ្នកមាន
                  </h2>
                  <p className="text-xs text-blue-600 font-medium">Account Exists</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="px-5 pb-5 space-y-4 overflow-y-auto flex-1">
              {/* Main message */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-blue-50 border border-blue-200 rounded-xl p-4"
              >
                <p className="text-sm text-gray-700 leading-relaxed">
                  {data?.message ||
                    "គណនីធនាគារលក់ដ៏ងរបស់អ្នកបានបង្កើតរួចរាល់។ អ្នកអាចបង្ហាញលេខគណនីរបស់អ្នក ឬបន្តប្រើប្រាស់វា។"}
                </p>
              </motion.div>

              {/* Account Details Card */}
              {(data?.cif || data?.accountNumber) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-300 rounded-xl p-4 space-y-3"
                >
                  <div className="space-y-2">
                    {data?.cif && (
                      <div>
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          លេខក្រុមហ៊ុន (CIF)
                        </label>
                        <p className="text-sm font-bold text-blue-700 mt-1 bg-white rounded px-3 py-2">
                          {data.cif}
                        </p>
                      </div>
                    )}
                    {data?.accountNumber && (
                      <div>
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          លេខគណនី
                        </label>
                        <p className="text-sm font-bold text-blue-700 mt-1 bg-white rounded px-3 py-2">
                          {data.accountNumber}
                        </p>
                      </div>
                    )}
                    {data?.accountName && (
                      <div>
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          ឈ្មោះគណនី
                        </label>
                        <p className="text-sm text-gray-700 mt-1 bg-white rounded px-3 py-2">
                          {data.accountName}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Benefits/Info */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  អ្វីដែលអ្នកអាចធ្វើ៖
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                    <ArrowRight className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">
                      ដាក់ប្រាក់ទៅក្នុងគណនីលក់របស់អ្នក
                    </span>
                  </div>
                  <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                    <ArrowRight className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">
                      ផ្ទេរប្រាក់ដោយលឿនរវាងគណនី
                    </span>
                  </div>
                  <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                    <ArrowRight className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">
                      ជ្រើសរើស ឬគ្រប់គ្រងលក្ខណៈពិសេសផ្សេងទៀត
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Buttons */}
            <div className="px-5 pb-5 space-y-2.5 flex-shrink-0 bg-white">
              <Button
                onClick={handleContinue}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2.5 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <Wallet className="w-4 h-4" />
                បន្តប្រើប្រាស់គណនី
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full font-semibold py-2.5 rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                បិទ
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AccountExistsModal;
