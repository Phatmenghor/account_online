"use client";

import { motion } from "framer-motion";
import { RotateCcw, BadgeCheck } from "lucide-react";

interface JuniorHeaderSectionProps {
  title: string;
  subtitle: string;
  onClear: () => void;
}

export const JuniorHeaderSection = ({
  title,
  subtitle,
  onClear,
}: JuniorHeaderSectionProps) => {
  return (
    <div className="mb-4 sm:mb-6">
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-l-4 border-orange-500 pl-4"
      >
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">
              {title}
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-semibold rounded-lg border border-orange-200">
              <BadgeCheck className="w-3 h-3" />
              CPBank Junior
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
            {subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={onClear}
          className="group self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 border border-slate-200 rounded-lg hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all duration-200 flex-shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>
      </motion.div>
    </div>
  );
};
