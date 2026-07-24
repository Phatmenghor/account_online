"use client";

import { motion } from "framer-motion";
import { Trash2, BadgeCheck } from "lucide-react";

interface HeaderSectionProps {
  title: string;
  onClear: () => void;
  translate: (key: string) => string;
}

export const HeaderSection = ({
  title,
  onClear,
  translate,
}: HeaderSectionProps) => {
  return (
    <div className="mb-4 sm:mb-6">
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-l-4 border-orange-500 pl-4"
      >
        {/* Left: title + subtitle */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-800 tracking-tight leading-tight">
              {title}
            </h1>
            <motion.span
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.18, duration: 0.25 }}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-semibold rounded-lg border border-orange-200"
            >
              <BadgeCheck className="w-3 h-3" />
              {translate("cpbank_acc")}
            </motion.span>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.22, duration: 0.35 }}
            className="text-sm sm:text-base text-gray-400"
          >
            {translate("sub_header_acc")}
          </motion.p>
        </div>

        {/* Right: compact clear button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClear}
          className="group self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 border border-gray-200 rounded-lg hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all duration-200 flex-shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{translate("clear")}</span>
        </motion.button>
      </motion.div>

      {/* Animated gradient underline */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 0.28, duration: 0.45, ease: "easeOut" }}
        className="origin-left h-px bg-gradient-to-r from-orange-400 via-orange-200 to-transparent mt-3 mb-0"
      />
    </div>
  );
};
