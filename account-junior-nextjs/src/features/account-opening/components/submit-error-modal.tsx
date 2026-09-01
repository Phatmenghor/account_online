"use client";

import { Button } from "@/components/ui/button";
import {
  XCircle,
  AlertTriangle,
  RefreshCcw,
  X,
  Camera,
  Wifi,
  Clock,
  Lock,
  Phone,
  HelpCircle,
  Shield,
  Hourglass,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

interface SubmitErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  description?: string;
  variant?: "error" | "warning";
  messageType?: string; // Detect type from backend message
}

type ErrorType =
  | "nid-not-found"
  | "face-not-found"
  | "face-capture-failed"
  | "connection-timeout"
  | "aml-high-risk"
  | "connection-error"
  | "system-busy"
  | "request-limit"
  | "pending-request"
  | "generic-error";

const detectErrorType = (message?: string): ErrorType => {
  if (!message) return "generic-error";

  const lowerMsg = message.toLowerCase();

  if (
    lowerMsg.includes("ដាក់ស្នើសុំបង្កើតគណនីរួចហើយ") ||
    lowerMsg.includes("pending request")
  ) {
    return "pending-request";
  } else if (
    lowerMsg.includes("សំណើរបស់អ្នក (aml high risk)") ||
    lowerMsg.includes("aml") ||
    lowerMsg.includes("high risk") ||
    lowerMsg.includes("ក្នុងការពិនិត្យ") ||
    lowerMsg.includes("ត្រួតពិនិត្យ")
  ) {
    return "aml-high-risk";
  } else if (
    lowerMsg.includes("អត្តសញ្ញាណប័ណ្ណរបស់អ្នកមិនអាចរកឃើញ") ||
    lowerMsg.includes("មិនអាចរកឃើញក្នុងប្រពន្ធ") ||
    lowerMsg.includes("id not found") ||
    lowerMsg.includes("លេខទូរស័ព្ទមិនត្រឹមត្រូវ")
  ) {
    return "nid-not-found";
  } else if (
    lowerMsg.includes("មិនអាចរកឃើញមុខ") ||
    lowerMsg.includes("no face") ||
    lowerMsg.includes("រូបថតខ្លួន")
  ) {
    return "face-not-found";
  } else if (
    lowerMsg.includes("មិនអាចចាប់យកផ្ទៃមុខ") ||
    lowerMsg.includes("cannot capture")
  ) {
    return "face-capture-failed";
  } else if (
    lowerMsg.includes("ការតភ្ជាប់មានភាពយឺតយ៉ាវ") ||
    lowerMsg.includes("connection timeout") ||
    lowerMsg.includes("timeout")
  ) {
    return "connection-timeout";
  } else if (
    lowerMsg.includes("ការស្នើសុំមិនអាចភ្ជាប់") ||
    lowerMsg.includes("cannot connect") ||
    lowerMsg.includes("connection failed") ||
    lowerMsg.includes("ឥណ្ឌើន")
  ) {
    return "connection-error";
  } else if (
    lowerMsg.includes("ប្រព័ន្ធកំពុងមានបញ្ហា") ||
    lowerMsg.includes("system busy")
  ) {
    return "system-busy";
  } else if (
    lowerMsg.includes("ការស្នើសុំលើសចំនួនកំណត់") ||
    lowerMsg.includes("request limit") ||
    lowerMsg.includes("exceeded")
  ) {
    return "request-limit";
  }

  return "generic-error";
};

const getErrorConfig = (errorType: ErrorType) => {
  const configs: Record<ErrorType, any> = {
    "nid-not-found": {
      Icon: HelpCircle,
      accent: "from-red-400 via-red-500 to-rose-500",
      iconBg: "from-red-400 to-rose-600",
      titleColor: "text-red-700",
      primaryBtn: "from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700",
      accentText: "text-red-600",
    },
    "face-not-found": {
      Icon: Camera,
      accent: "from-red-400 via-red-500 to-rose-500",
      iconBg: "from-red-400 to-rose-600",
      titleColor: "text-red-700",
      primaryBtn: "from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700",
      accentText: "text-red-600",
    },
    "face-capture-failed": {
      Icon: Camera,
      accent: "from-red-400 via-red-500 to-rose-500",
      iconBg: "from-red-400 to-rose-600",
      titleColor: "text-red-700",
      primaryBtn: "from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700",
      accentText: "text-red-600",
    },
    "connection-timeout": {
      Icon: Clock,
      accent: "from-amber-400 via-yellow-500 to-orange-400",
      iconBg: "from-amber-400 to-orange-500",
      titleColor: "text-amber-700",
      primaryBtn: "from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
      accentText: "text-amber-600",
    },
    "connection-error": {
      Icon: Wifi,
      accent: "from-red-400 via-red-500 to-rose-500",
      iconBg: "from-red-400 to-rose-600",
      titleColor: "text-red-700",
      primaryBtn: "from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700",
      accentText: "text-red-600",
    },
    "aml-high-risk": {
      Icon: Shield,
      accent: "from-purple-400 via-purple-500 to-indigo-500",
      iconBg: "from-purple-400 to-indigo-600",
      titleColor: "text-purple-700",
      primaryBtn: "from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700",
      accentText: "text-purple-600",
    },
    "system-busy": {
      Icon: AlertTriangle,
      accent: "from-amber-400 via-yellow-500 to-orange-400",
      iconBg: "from-amber-400 to-orange-500",
      titleColor: "text-amber-700",
      primaryBtn: "from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
      accentText: "text-amber-600",
    },
    "request-limit": {
      Icon: Lock,
      accent: "from-orange-400 via-orange-500 to-red-500",
      iconBg: "from-orange-400 to-red-600",
      titleColor: "text-orange-700",
      primaryBtn: "from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700",
      accentText: "text-orange-600",
    },
    "pending-request": {
      Icon: Hourglass,
      accent: "from-blue-400 via-blue-500 to-cyan-400",
      iconBg: "from-blue-400 to-cyan-500",
      titleColor: "text-blue-700",
      primaryBtn: "from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600",
      accentText: "text-blue-600",
    },
    "generic-error": {
      Icon: XCircle,
      accent: "from-red-400 via-red-500 to-rose-500",
      iconBg: "from-red-400 to-rose-600",
      titleColor: "text-red-700",
      primaryBtn: "from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700",
      accentText: "text-red-600",
    },
  };

  return configs[errorType];
};

export default function SubmitErrorModal({
  isOpen,
  onClose,
  title,
  message,
  description,
  variant = "error",
  messageType,
}: SubmitErrorModalProps) {
  const translate = useTranslations("NIDPage");

  // Detect error type from message
  const errorType = messageType ? (messageType as ErrorType) : detectErrorType(message);
  const config = getErrorConfig(errorType);
  const Icon = config.Icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />

          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="relative bg-white w-full max-w-lg sm:max-w-[480px] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden z-10 border border-gray-100 flex flex-col max-h-[90vh]"
          >
            {/* Top Accent Line at absolute top */}
            <div className={`h-1.5 w-full bg-gradient-to-r ${config.accent} shrink-0`} />

            {/* Native Mobile Drag Handle Pill */}
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto my-2 sm:hidden shrink-0" />

            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100/80 flex items-center justify-between bg-white flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config.iconBg} flex items-center justify-center text-white flex-shrink-0 shadow-sm`}>
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className={`text-base font-bold ${config.titleColor} tracking-tight`}>
                  {title}
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body - Left Aligned Message */}
            <div className="px-6 py-6 overflow-y-auto">
              <p className="text-sm text-slate-700 leading-relaxed text-left font-medium">
                {message?.replace(/\(AML High Risk\)/gi, "").replace(/AML High Risk/gi, "").trim()}
              </p>
              {description && (
                <p className="text-xs text-slate-500 mt-2 text-left">
                  {description?.replace(/\(AML High Risk\)/gi, "").replace(/AML High Risk/gi, "").trim()}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100/80 bg-slate-50/50 flex flex-col sm:flex-row justify-end items-center gap-3 rounded-b-2xl flex-shrink-0">
              <Button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto h-10 px-5 text-sm font-medium rounded-xl border border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
              >
                {translate("close") || "Close"}
              </Button>
              <Button
                type="button"
                onClick={onClose}
                className={`w-full sm:w-auto h-10 px-6 text-sm font-semibold rounded-xl bg-gradient-to-r ${config.primaryBtn} text-white shadow-sm transition-all flex items-center justify-center gap-1.5`}
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                {translate("try_again") || "Try Again"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
