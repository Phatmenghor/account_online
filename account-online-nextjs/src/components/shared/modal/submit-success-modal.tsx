"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle, Copy } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { OpenAccountResponse } from "@/models/open-account/openAccount.response";
import { useState } from "react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: OpenAccountResponse | null;
}

function CopyField({ label, value }: { label: string; value?: string }) {
  const [copied, setCopied] = useState(false);
  if (!value) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-sm font-semibold text-gray-800 font-mono tracking-wide">{value}</p>
      </div>
      <button
        onClick={handleCopy}
        className="ml-3 p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors flex-shrink-0"
        title="Copy"
      >
        {copied ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}

export default function SubmitSuccessModal({ isOpen, onClose, data }: SuccessModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden z-10"
          >
            <div className="h-1.5 bg-primary" />

            <div className="px-6 sm:px-8 py-6 sm:py-8 flex flex-col items-center">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
                className="relative mb-4"
              >
                <div className="absolute inset-0 bg-primary rounded-full blur-2xl opacity-30 animate-pulse" />
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary flex items-center justify-center shadow-xl">
                  <CheckCircle className="text-white" style={{ width: 32, height: 32 }} />
                </div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-xl sm:text-2xl font-bold text-gray-900 text-center"
              >
                បង្កើតគណនីជោគជ័យ
              </motion.h2>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.25, duration: 0.4 }}
                className="h-1 w-10 bg-primary rounded-full mt-2 mb-5"
              />

              {data && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="w-full bg-gray-50 rounded-2xl px-4 py-3 mb-5 border border-gray-100"
                >
                  <CopyField label="CIF" value={data.cif} />
                  <CopyField label="KHR Account" value={data.khrAccount} />
                  <CopyField label="USD Account" value={data.usdAccount} />
                  <CopyField label="Mnemonic" value={data.mnemonic} />
                  <CopyField label="MB Activation Code" value={data.mbActivationCode} />
                  {data.submittedBy && (
                    <div className="pt-2 mt-1 border-t border-gray-100">
                      <p className="text-xs text-gray-400">
                        Processed by: <span className="font-medium text-gray-600">{data.submittedBy}</span>
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="w-full"
              >
                <Button
                  onClick={onClose}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95"
                >
                  យល់ព្រម
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
