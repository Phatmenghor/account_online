"use client";

import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden z-10 border border-blue-100"
          >
            <div className="px-8 py-10 flex flex-col items-center text-center">
              {/* Hourglass Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 15, stiffness: 150 }}
                className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center mb-6 shadow-lg"
              >
                <Clock className="text-white" style={{ width: 28, height: 28 }} />
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-2xl font-bold text-blue-600 mb-4"
              >
                {title || "ស្នើសុំបានរីករាយ"}
              </motion.h2>

              {/* Message */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-sm text-gray-600 leading-relaxed mb-8"
              >
                {message}
              </motion.p>

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="w-full flex gap-3"
              >
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50 py-2.5 rounded-lg font-medium"
                >
                  ✕ ទេ
                </Button>
                <Button
                  onClick={onClose}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-lg font-medium"
                >
                  ស្វាគមន៍ចូល
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
