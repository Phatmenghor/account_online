"use client";

import React from "react";
import { UserModel } from "@/features/user/types/user.response";
import { User, Mail, Phone, Briefcase, Building2, Landmark, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProfileInfoGridProps {
  user?: UserModel | null;
}

export function ProfileInfoGrid({ user }: ProfileInfoGridProps) {
  // User Identifier / ID Card is displayed at the top header, so we list remaining details here
  const fields = [
    {
      label: "Full Name",
      value: user?.fullName || "—",
      icon: User,
    },
    {
      label: "Email Address",
      value: user?.email || "—",
      icon: Mail,
    },
    {
      label: "Phone Number",
      value: user?.phoneNumber || "—",
      icon: Phone,
    },
    {
      label: "Position",
      value: user?.position || "—",
      icon: Briefcase,
    },
    {
      label: "Branch",
      value: user?.branch || "—",
      icon: Building2,
    },
    {
      label: "Department",
      value: user?.department || "—",
      icon: Landmark,
    },
  ];

  const isUserActive = user?.userStatus === "ACTIVE" || !user?.userStatus;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
        <div>
          <h3 className="text-base font-bold text-slate-900">Account Information</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            View your personal account details and organizational assignments.
          </p>
        </div>
        <Badge variant="outline" className="text-xs font-semibold px-2.5 py-1 rounded-lg border-slate-200 bg-slate-50 text-slate-600 gap-1.5 shrink-0">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Read Only
        </Badge>
      </div>

      <div className="grid gap-3 sm:gap-3.5 grid-cols-1 sm:grid-cols-2">
        {fields.map((field) => {
          const Icon = field.icon;
          return (
            <div
              key={field.label}
              className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 transition-colors"
            >
              {/* Icon Container — Always visible on mobile */}
              <div className="h-9.5 w-9.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-primary shadow-2xs shrink-0">
                <Icon className="h-4 w-4 shrink-0" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-500">{field.label}</p>
                <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate mt-0.5">
                  {field.value}
                </p>
              </div>
            </div>
          );
        })}

        {/* Account Status Item */}
        <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 transition-colors">
          <div className="h-9.5 w-9.5 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shadow-2xs shrink-0">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-slate-500">Account Status</p>
            <div className="mt-1">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  isUserActive
                    ? "bg-emerald-100/80 text-emerald-800 border border-emerald-300/80"
                    : "bg-slate-100 text-slate-700 border border-slate-300"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${isUserActive ? "bg-emerald-600" : "bg-slate-500"}`} />
                {user?.userStatus || "ACTIVE"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
