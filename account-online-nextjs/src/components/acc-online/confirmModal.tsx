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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.97 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-white w-full sm:max-w-[520px] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden z-10"
          >
            <div className="h-1.5 w-full bg-primary" />

            <div className="px-6 pt-8 pb-6 flex flex-col items-center text-center">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.1 }}
                className="w-16 h-16 rounded-lg bg-primary/10 border-2 border-primary/20 flex items-center justify-center mb-5 shadow-sm"
              >
                <ShieldCheck className="text-primary" style={{ width: 30, height: 30 }} />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl sm:text-2xl font-bold text-gray-800 mb-3"
              >
                {title}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-base sm:text-base text-gray-500 leading-relaxed mb-7"
              >
                {message}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row sm:justify-center gap-3 w-full"
              >
                <Button
                  onClick={onCancel}
                  className="w-full sm:flex-1 h-auto min-h-12 flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-200 text-gray-600 font-semibold text-base rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                >
                  <XCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="whitespace-normal leading-tight text-center">{translate("noIneed")}</span>
                </Button>
                <Button
                  onClick={onConfirm}
                  className="w-full sm:flex-1 h-auto min-h-12 flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base rounded-lg transition-all shadow-sm"
                >
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="whitespace-normal leading-tight text-center">{translate("yesIhave")}</span>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;
