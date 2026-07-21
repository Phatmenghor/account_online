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
  const translate = useTranslations("common");

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
            {/* Top accent bar - Primary color */}
            <div className="h-1.5 w-full bg-primary flex-shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                  <Wallet style={{ width: 20, height: 20 }} className="text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-800">
                    គណនីរបស់អ្នកមាន
                  </h2>
                  <p className="text-xs text-primary font-medium">Account Exists</p>
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
                className="bg-primary/5 border border-primary/20 rounded-xl p-4"
              >
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {data?.message ||
                    "គណនីធនាគារលក់ដ៏ងរបស់អ្នកបានបង្កើតរួចរាល់។ អ្នកអាចបង្ហាញលេខគណនីរបស់អ្នក ឬបន្តប្រើប្រាស់វា។"}
                </p>
              </motion.div>

              {/* Account Details Card */}
              {(data?.cif || data?.accountNumber || data?.accountName) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3"
                >
                  <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    ព័ត៌មានលម្អិតគណនី
                  </h4>
                  <div className="space-y-2">
                    {data?.cif && (
                      <div>
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          លេខក្រុមហ៊ុន (CIF)
                        </label>
                        <p className="text-sm font-bold text-primary mt-1 bg-white rounded px-3 py-2">
                          {data.cif}
                        </p>
                      </div>
                    )}
                    {data?.accountNumber && (
                      <div>
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          លេខគណនី
                        </label>
                        <p className="text-sm font-bold text-primary mt-1 bg-white rounded px-3 py-2">
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

              {/* Support Contact Info */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2"
              >
                <p className="text-sm font-semibold text-gray-700">
                  070 200 002&nbsp;&nbsp;|&nbsp;&nbsp;1800 200 888 <span className="font-normal text-gray-500">(ឥតគិតថ្លៃ)</span>
                </p>
                <p className="text-sm text-gray-600">info@cambodiapostbank.com.kh</p>
              </motion.div>
            </div>

            {/* Buttons */}
            <div className="px-5 pb-5 flex-shrink-0 bg-white">
              <Button
                onClick={onClose}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-lg shadow-sm transition-all"
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
