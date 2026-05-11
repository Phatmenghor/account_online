"use client";

import { motion, AnimatePresence } from "framer-motion";

interface LoadingModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
}

export default function LoadingModal({
  isOpen,
  title = "Processing",
  message = "Please wait...",
}: LoadingModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.88 }}
            transition={{ type: "spring", damping: 22, stiffness: 260 }}
            className="relative bg-white w-full max-w-xs sm:max-w-sm rounded-2xl shadow-2xl overflow-hidden z-10"
          >
            <div className="h-1.5 w-full bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500" />

            <div className="flex flex-col items-center px-6 py-8 text-center">
              {/* Spinner rings */}
              <div className="relative w-16 h-16 mb-5">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-lg border-4 border-orange-200 border-t-orange-500"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 1.9, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-2 rounded border-4 border-amber-100 border-b-amber-400"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                    className="w-3 h-3 bg-gradient-to-br from-orange-400 to-amber-500 rounded"
                  />
                </div>
              </div>

              {/* Bouncing dots */}
              <div className="flex gap-1.5 mb-4">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.85, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
                    className="w-2 h-2 bg-orange-400 rounded"
                  />
                ))}
              </div>

              <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-1.5">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
