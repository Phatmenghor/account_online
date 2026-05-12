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
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative bg-gradient-to-b from-white to-gray-50 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden z-10"
          >
            {/* Top accent bar */}
            <div className="h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700" />

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
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur-xl opacity-40 animate-pulse" />
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-2xl">
                  <CheckCircle className="text-white" style={{ width: 40, height: 40 }} />
                </div>
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3"
              >
                {title || "សូមរង់ចាំ"}
              </motion.h2>

              {/* Subtitle */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="h-1 w-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mb-6"
              />

              {/* Message */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="w-full mb-8 px-2"
              >
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
                  {message}
                </p>
              </motion.div>

              {/* Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="w-full px-2"
              >
                <Button
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 sm:py-3 rounded-xl sm:rounded-2xl font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95"
                >
                  យល់ព្រម
                </Button>
              </motion.div>

              {/* Bottom info text */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xs sm:text-sm text-gray-500 mt-6 px-2"
              >
                ▼ ចុចដើម្បីបិទ
              </motion.p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
