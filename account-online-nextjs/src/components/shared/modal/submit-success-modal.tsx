"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { OpenAccountResponse } from "@/models/open-account/openAccount.response";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: OpenAccountResponse | null;
}

export default function SubmitSuccessModal({ isOpen, onClose }: SuccessModalProps) {
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

            <div className="px-6 sm:px-8 py-8 sm:py-10 flex flex-col items-center">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
                className="relative mb-5"
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
                គណនីត្រូវបានបង្កើតដោយជោគជ័យ!
              </motion.h2>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.25, duration: 0.4 }}
                className="h-1 w-10 bg-primary rounded-full mt-2 mb-5"
              />

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="text-sm sm:text-base text-gray-600 text-center leading-relaxed mb-8"
              >
                ព័ត៌មានលម្អិតគណនីរបស់លោក/លោកស្រី
                នឹងត្រូវបានផ្ញើទៅកាន់លេខទូរស័ព្ទ
                តាមរយៈសារ SMS ។
              </motion.p>

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
