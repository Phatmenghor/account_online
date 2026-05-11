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
  | "generic-error";

const detectErrorType = (message?: string): ErrorType => {
  if (!message) return "generic-error";

  const lowerMsg = message.toLowerCase();

  if (
    lowerMsg.includes("សំណើរបស់អ្នក (AML High Risk)") ||
    lowerMsg.includes("aml") ||
    lowerMsg.includes("high risk")
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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.97 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden z-10"
          >
            <div className={`h-1.5 w-full bg-gradient-to-r ${config.accent}`} />

            <div className="px-6 pt-8 pb-6 flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.1 }}
                className={`w-16 h-16 rounded-lg bg-gradient-to-br ${config.iconBg} flex items-center justify-center mb-5 shadow-sm`}
              >
                <Icon className="text-white" style={{ width: 30, height: 30 }} />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`text-lg sm:text-xl font-bold ${config.titleColor} mb-2`}
              >
                {title}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-sm sm:text-base text-gray-500 leading-relaxed mb-7"
              >
                {message}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-3 w-full"
              >
                <Button
                  onClick={onClose}
                  className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-600 font-semibold py-2.5 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                >
                  <X className="w-4 h-4" />
                  {translate("close") || "Close"}
                </Button>
                <Button
                  onClick={onClose}
                  className={`flex-1 flex items-center justify-center gap-2 bg-gradient-to-r ${config.primaryBtn} text-white font-semibold py-2.5 rounded-lg transition-all shadow-sm`}
                >
                  <RefreshCcw className="w-4 h-4" />
                  {translate("try_again") || "Try Again"}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
