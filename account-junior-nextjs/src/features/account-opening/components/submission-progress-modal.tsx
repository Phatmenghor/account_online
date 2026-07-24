"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, ShieldCheck, FileCheck, Landmark } from "lucide-react";

interface SubmissionProgressModalProps {
  isOpen: boolean;
  progress: number; // 0 to 100
  title?: string;
  message?: string;
}

export function SubmissionProgressModal({
  isOpen,
  progress,
  title = "កំពុងដំណើរការបង្កើតគណនី",
  message = "សូមរង់ចាំបន្តិច...",
}: SubmissionProgressModalProps) {
  const [displayProgress, setDisplayProgress] = useState(0);

  // Smooth counter animation
  useEffect(() => {
    if (!isOpen) {
      setDisplayProgress(0);
      return;
    }

    const timer = setTimeout(() => {
      setDisplayProgress((prev) => {
        if (prev < progress) {
          return Math.min(prev + 1, progress);
        } else if (prev > progress) {
          return Math.max(prev - 1, progress);
        }
        return prev;
      });
    }, 15);

    return () => clearTimeout(timer);
  }, [progress, displayProgress, isOpen]);

  // Determine current step badge & message based on progress %
  const getStepInfo = (pct: number) => {
    if (pct < 20) {
      return {
        step: 1,
        icon: Loader2,
        label: "កំពុងបង្រួមរូបភាព (Compressing Images)",
        detail: "បង្រួមទំហំរូបភាពអត្តសញ្ញាណប័ណ្ណ និង រូបថតខ្លួន",
      };
    } else if (pct < 55) {
      return {
        step: 2,
        icon: FileCheck,
        label: "កំពុងបង្ហោះឯកសារ (Uploading Documents)",
        detail: "បញ្ជូនរូបភាពឯកសារទៅកាន់ប្រព័ន្ធធនាគារ",
      };
    } else if (pct < 80) {
      return {
        step: 3,
        icon: ShieldCheck,
        label: "កំពុងផ្ទៀងផ្ទាត់ព័ត៌មាន (Verifying Profile)",
        detail: "ពិនិត្យផ្ទៀងផ្ទាត់ព័ត៌មាន និង បញ្ជី AML Risk",
      };
    } else if (pct < 100) {
      return {
        step: 4,
        icon: Landmark,
        label: "កំពុងបង្កើតគណនី (Creating Bank Account)",
        detail: "បង្កើតលេខគណនីធនាគារក្នុងប្រព័ន្ធ Core-Banking",
      };
    } else {
      return {
        step: 5,
        icon: CheckCircle2,
        label: "បង្កើតគណនីជោគជ័យ! (Account Created)",
        detail: "ការស្នើសុំបង្កើតគណនីត្រូវបានបញ្ចប់ដោយជោគជ័យ",
      };
    }
  };

  const currentStep = getStepInfo(displayProgress);
  const StepIcon = currentStep.icon;

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
            className="relative bg-white w-full max-w-lg sm:max-w-[440px] rounded-2xl shadow-2xl overflow-hidden z-10 border border-gray-100 p-6 sm:p-8 flex flex-col items-center text-center"
          >
            {/* Primary Accent Top Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary" />

            {/* Circular Progress Badge with Animated Loading Aura */}
            <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
              {/* Soft Pulsing Primary Glow */}
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />

              {/* Outer Progress Ring */}
              <svg className="w-full h-full transform -rotate-90 relative z-10" viewBox="0 0 36 36">
                <path
                  className="text-gray-100"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-primary transition-all duration-300 ease-out"
                  strokeDasharray={`${displayProgress}, 100`}
                  strokeWidth="3"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>

              {/* Center Percentage Display */}
              <div className="absolute flex flex-col items-center justify-center z-20">
                <span className="text-2xl font-extrabold text-primary leading-none tracking-tight">
                  {displayProgress}%
                </span>
                {displayProgress < 100 && (
                  <span className="text-[10px] text-gray-400 font-medium mt-1 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin text-primary" />
                    <span>Loading...</span>
                  </span>
                )}
              </div>
            </div>

            {/* Title & Message */}
            <h3 className="text-base sm:text-lg font-bold text-gray-800 leading-tight mb-2">
              {title}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              {message || "សូមរង់ចាំបន្តិច ប្រព័ន្ធកំពុងដំណើរការស្នើសុំគណនីរបស់លោកអ្នក..."}
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
