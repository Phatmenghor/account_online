"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Shield, CheckCircle, AlertTriangle, Lock, User } from "lucide-react";
import { ChangeUserPasswordByAdminService } from "@/services/dashboard/user/user.service";
import { AppToast } from "../toast/app-toast";

export default function ResetPasswordModal({
  userId,
  userName,
  isOpen,
  onClose,
}: {
  userId?: number;
  userName?: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const DEFAULT_PASSWORD = "88889999";
  const onReset = async () => {
    if (!userId) {
      console.error("Missing userId found!");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await ChangeUserPasswordByAdminService({
        id: userId,
        confirmNewPassword: DEFAULT_PASSWORD,
        newPassword: DEFAULT_PASSWORD,
      });
      if (response) {
        AppToast({
          type: "success",
          message: "User password reset successfully",
        });
        onClose();
      }
    } catch (error) {
      console.error("Reset failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setShowSuccess(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[95vw] mx-auto rounded-2xl shadow-xl bg-white p-0 overflow-hidden border border-slate-200">
        {showSuccess ? (
          <div className="flex flex-col">
            {/* Success Header */}
            <div className="bg-gradient-to-r from-emerald-700 to-teal-700 p-4 text-center">
              <div className="w-12 h-12 bg-white/95 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <DialogTitle className="text-xl font-bold text-white mb-1">
                Password Reset Successful
              </DialogTitle>
              <p className="text-emerald-100 text-sm">
                Action completed successfully
              </p>
            </div>

            {/* Success Content */}
            <div className="p-4 space-y-5">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-gray-900 font-semibold">
                    {userName || "User Account"}
                  </span>
                </div>
                <DialogDescription className="text-gray-600 text-sm leading-relaxed">
                  Password has been reset successfully. User can now login with
                  the new credentials.
                </DialogDescription>
              </div>

              {/* New Password Display */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-blue-900 text-sm">
                    New Password
                  </span>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center bg-white border-2 border-blue-300 rounded-lg px-4 py-2">
                    <span className="font-mono text-xl font-bold text-blue-800 tracking-wider">
                      88889999
                    </span>
                  </div>
                </div>
                <p className="text-blue-700 text-xs text-center mt-2">
                  Share securely with user
                </p>
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={handleClose}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors duration-200"
                >
                  Complete
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Warning Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-2 text-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-1">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <DialogTitle className="text-xl font-bold text-white mb-1">
                Reset Password
              </DialogTitle>
              <p className="text-red-100 text-sm">Confirm security action</p>
            </div>

            {/* Confirmation Content */}
            <div className="p-4 space-y-3">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="text-gray-900 font-semibold">
                    {userName || "Selected User"}
                  </span>
                </div>
              </div>

              {/* Warning Box */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-900 text-sm mb-2">
                      Default Password
                    </h4>
                    <div className="inline-flex items-center bg-white border border-amber-300 rounded-lg px-3 py-1 mb-2">
                      <span className="font-mono text-base font-bold text-amber-800">
                        88889999
                      </span>
                    </div>
                    <p className="text-amber-700 text-xs">
                      User should change password after first login.
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="bg-gray-200" />

              {/* Action Buttons */}
              <DialogFooter className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="min-w-[100px] border-slate-300 text-slate-700 hover:bg-slate-50 font-medium py-2"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={onReset}
                  disabled={isSubmitting}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-semibold min-w-[100px] py-2 transition-colors duration-200"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Resetting...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Reset
                    </div>
                  )}
                </Button>
              </DialogFooter>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
