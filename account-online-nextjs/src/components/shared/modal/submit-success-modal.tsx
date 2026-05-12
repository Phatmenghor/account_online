"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  description?: string;
  status?: string;
}

export default function SubmitSuccessModal({
  isOpen,
  onClose,
  title,
  message,
  description,
  status = "PENDING",
}: SuccessModalProps) {
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
            {/* Top accent bar - Primary color */}
            <div className="h-1.5 bg-primary" />

            <div className="px-6 sm:px-8 py-8 sm:py-10 flex flex-col items-center text-center">
              {/* Icon with animation */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  damping: 12,
                  stiffness: 200,
                  delay: 0.1
                }}
                className="relative mb-6"
              >
                <div className="absolute inset-0 bg-primary rounded-full blur-2xl opacity-30 animate-pulse" />
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary flex items-center justify-center shadow-xl">
                  <CheckCircle className="text-white" style={{ width: 40, height: 40 }} />
                </div>
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1"
              >
                {title || "សូមរង់ចាំ"}
              </motion.h2>

              {/* Decorative line */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.25, duration: 0.4 }}
                className="h-1 w-12 bg-primary rounded-full mt-3 mb-6"
              />

              {/* Message */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="w-full mb-8 px-1"
              >
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {message}
                </p>
              </motion.div>

              {/* Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="w-full"
              >
                <Button
                  onClick={onClose}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 sm:py-3 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95"
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
