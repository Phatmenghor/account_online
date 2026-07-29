"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

interface SubmissionProgressModalProps {
  isOpen: boolean;
  progress?: number;
  title?: string;
  message?: string;
}

export function SubmissionProgressModal({
  isOpen,
  title = "កំពុងដំណើរការបង្កើតគណនី",
  message = "សូមរង់ចាំបន្តិច ប្រព័ន្ធកំពុងដំណើរការស្នើសុំគណនីរបស់លោកអ្នក...",
}: SubmissionProgressModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden z-10 border border-gray-100 p-6 flex flex-col items-center text-center"
          >
            {/* Primary Accent Top Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary" />

            {/* Loading Icon with Animated Pulsing Glow */}
            <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
              <div className="absolute inset-0 bg-primary/15 rounded-full blur-md animate-pulse" />
              <div className="w-14 h-14 bg-primary/10 rounded-full border border-primary/20 flex items-center justify-center text-primary relative z-10">
                <Loader2 className="w-7 h-7 animate-spin text-primary" />
              </div>
            </div>

            {/* Title & Message */}
            <h3 className="text-base font-bold text-gray-900 leading-tight mb-2">
              {title}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
              {message}
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
