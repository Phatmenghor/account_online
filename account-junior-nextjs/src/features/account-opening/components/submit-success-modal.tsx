"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { OpenAccountResponse } from "@/features/account-opening/types/openAccount.response";

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
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="relative bg-white w-full max-w-lg sm:max-w-[480px] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden z-10 border border-gray-100 flex flex-col max-h-[90vh]"
          >
            {/* Primary Top Accent */}
            <div className="h-1.5 w-full bg-primary flex-shrink-0" />

            {/* Native Mobile Drag Handle Pill */}
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto my-2 sm:hidden shrink-0" />

            {/* Body */}
            <div className="px-6 py-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                <CheckCircle className="w-10 h-10 text-primary" />
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                សូមស្វាគមន៍មកកាន់ Cambodia Post Bank!
              </h2>

              <div className="w-full bg-primary/5 border border-primary/15 rounded-xl p-4 mt-3 text-left space-y-2">
                <p className="text-sm text-gray-700 leading-relaxed">
                  គណនីធនាគាររបស់លោក/លោកស្រី
                  <span className="font-bold text-primary"> ត្រូវបានបង្កើតដោយជោគជ័យ</span> រួចរាល់ហើយ។
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  ព័ត៌មានលម្អិតគណនីត្រូវបានផ្ញើទៅកាន់ លេខទូរស័ព្ទរបស់លោក/លោកស្រីតាមរយៈ
                  <span className="font-medium text-gray-700"> សារ SMS</span>។
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100/80 bg-slate-50/50 flex justify-end items-center rounded-b-2xl flex-shrink-0">
              <Button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto h-10 px-6 text-sm font-semibold rounded-xl bg-primary hover:bg-primary/90 text-white shadow-xs transition-all"
              >
                យល់ព្រម
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
