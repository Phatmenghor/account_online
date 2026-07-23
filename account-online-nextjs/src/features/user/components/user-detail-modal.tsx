"use client";

import type React from "react";
import { User } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UserModel } from "@/features/user/types/user.response";
import { DateTimeFormat } from "@/utils/date/date-time-format";
import { RoleBadge } from "@/components/shared/badge/role-badge";
import { UserStatusBadge } from "@/components/shared/badge/user-badge";

interface UserViewModalProps {
  user?: UserModel;
  isOpen: boolean;
  onClose: () => void;
}

function InfoRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex justify-between border-b pb-2 gap-4">
      <Label className="text-sm font-medium text-muted-foreground shrink-0">
        {label}:
      </Label>
      <span className="text-sm font-semibold text-right">{value || "N/A"}</span>
    </div>
  );
}

function SectionHeader({ color, title }: { color?: string; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <div className={`w-1 h-5 ${color || "bg-primary"} rounded-full shrink-0`} />
      <h3 className="text-base font-bold text-gray-900 dark:text-white">{title}</h3>
    </div>
  );
}

export function UserViewModal({ user, isOpen, onClose }: UserViewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl sm:max-w-2xl w-full max-h-[88vh] overflow-hidden p-0 gap-0 flex flex-col">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-4 pr-8">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <User className="w-6 h-6 text-foreground" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold">
                User Profile
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                {user?.fullName
                  ? `Profile information for "${user.fullName}"`
                  : user?.email
                  ? `Profile information for "${user.email}"`
                  : "User profile information"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-6">
            {user ? (
              <div className="space-y-6">

                {/* Personal Information (merged with Account Information) */}
                <div className="space-y-4">
                  <SectionHeader color="bg-blue-600" title="Personal Information" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoRow label="Full Name" value={user.fullName} />
                    <InfoRow label="ID Card" value={user.idCard?.split("@")[0]} />
                    <InfoRow label="Email" value={user.email} />
                    <InfoRow label="Phone Number" value={user.phoneNumber} />
                    <InfoRow label="Position" value={user.position} />
                    <InfoRow label="Branch" value={user.branch} />
                    <InfoRow label="Department" value={user.department} />
                    <div className="flex justify-between border-b pb-2 gap-4">
                      <Label className="text-sm font-medium text-muted-foreground shrink-0">Role:</Label>
                      <RoleBadge role={user.userRole || ""} />
                    </div>
                    <div className="flex justify-between border-b pb-2 gap-4">
                      <Label className="text-sm font-medium text-muted-foreground shrink-0">Status:</Label>
                      <UserStatusBadge status={user.userStatus} />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* System Information */}
                <div className="space-y-4">
                  <SectionHeader color="bg-gray-600" title="System Information" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoRow label="Created At" value={DateTimeFormat(user.createdAt)} />
                    <InfoRow label="Last Login" value={DateTimeFormat(user.lastLogin)} />
                    <InfoRow label="Updated At" value={DateTimeFormat(user.updatedAt)} />
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No user data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
      </DialogContent>
    </Dialog>
  );
}


