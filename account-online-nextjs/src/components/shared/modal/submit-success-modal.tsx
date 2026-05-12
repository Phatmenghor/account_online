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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden z-10"
          >
            <div className="px-8 py-10 flex flex-col items-center text-center">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 15, stiffness: 150 }}
                className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mb-6 shadow-lg"
              >
                <CheckCircle className="text-white" style={{ width: 28, height: 28 }} />
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl font-bold text-gray-900 mb-4"
              >
                {title || "សូមរង់ចាំ"}
              </motion.h2>

              {/* Message */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="w-full mb-8"
              >
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {message}
                </p>
              </motion.div>

              {/* Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="w-full"
              >
                <Button
                  onClick={onClose}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium"
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
