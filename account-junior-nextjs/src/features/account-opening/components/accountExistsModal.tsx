"use client";

import { Wallet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import {
  CustomModal,
  CustomModalHeader,
  CustomModalBody,
  CustomModalFooter,
} from "@/components/shared/modal/custom-modal";

interface AccountExistsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: {
    cif?: string;
    accountNumber?: string;
    accountName?: string;
    message?: string;
  } | null;
}

const AccountExistsModal = ({
  isOpen,
  onClose,
  data,
}: AccountExistsModalProps) => {
  const translate = useTranslations("NIDPage");

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} size="md">
      {/* Top Primary Accent Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-primary/80 via-primary to-primary/80 shrink-0" />

      {/* Header */}
      <CustomModalHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-xs">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
              គណនីរបស់អ្នកមានរួចហើយ
            </h3>
            <p className="text-xs text-primary font-medium">Account Already Exists</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </CustomModalHeader>

      {/* Body */}
      <CustomModalBody>
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 space-y-4">
          <p className="text-sm font-medium text-slate-800 leading-relaxed whitespace-pre-wrap">
            {data?.message ||
              "លោកអ្នកមានគណនីជាមួយធនាគាររួចហើយ។ សូមប្រើប្រាស់ជាមួយគណនីរបស់លោកអ្នក។"}
          </p>

          <div className="pt-3 border-t border-primary/15 text-xs text-slate-600 space-y-1">
            <p className="font-semibold text-slate-700">ទំនាក់ទំនងគាំទ្រ៖ 070 200 002 | 1800 200 888</p>
            <p className="text-slate-500">info@cambodiapostbank.com.kh</p>
          </div>
        </div>
      </CustomModalBody>

      {/* Footer */}
      <CustomModalFooter>
        <Button
          type="button"
          onClick={onClose}
          className="w-full sm:w-auto h-11 px-6 text-sm font-semibold rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20 transition-all active:scale-[0.98]"
        >
          {translate("close")}
        </Button>
      </CustomModalFooter>
    </CustomModal>
  );
};

export default AccountExistsModal;
