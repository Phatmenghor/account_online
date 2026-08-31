"use client";

import React from "react";
import { Camera, Edit3, X, Mail, Calendar, Clock, CheckCircle2, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { UserModel } from "@/features/user/types/user.response";
import { DateTimeFormat } from "@/utils/date/date-time-format";

interface ProfileHeaderCardProps {
  user?: UserModel | null;
  profileImageUrl: string;
  editMode: boolean;
  isSubmitting: boolean;
  imageData: { type: string; base64: string } | null;
  fileInputRef: React.LegacyRef<HTMLInputElement> | undefined;
  toggleEditMode: () => void;
  handleAvatarClick: () => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePhotoMouseEnter: () => void;
  handlePhotoMouseLeave: () => void;
}

export function ProfileHeaderCard({
  user,
  profileImageUrl,
  editMode,
  isSubmitting,
  imageData,
  fileInputRef,
  toggleEditMode,
  handleAvatarClick,
  handleImageUpload,
  handlePhotoMouseEnter,
  handlePhotoMouseLeave,
}: ProfileHeaderCardProps) {
  const isUserActive = user?.userStatus === "ACTIVE" || !user?.userStatus;
  const userIdentifier = user?.idCard || user?.email || "User Profile";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition-shadow hover:shadow-sm">
      {/* Top Banner Gradient */}
      <div className="h-28 sm:h-32 bg-gradient-to-r from-primary via-orange-500 to-amber-500 relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:16px_16px]" />
      </div>

      <div className="relative px-4 sm:px-6 pb-6 pt-0">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 -mt-14 items-center sm:items-end justify-between">
          {/* Avatar & Title Container */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3.5 sm:gap-5 w-full sm:w-auto text-center sm:text-left">
            {/* Avatar */}
            <div
              className={`relative group z-10 rounded-full mx-auto sm:mx-0 ${
                editMode ? "cursor-pointer" : "cursor-default"
              }`}
              onClick={editMode ? handleAvatarClick : undefined}
              onMouseEnter={handlePhotoMouseEnter}
              onMouseLeave={handlePhotoMouseLeave}
              role={editMode ? "button" : undefined}
            >
              <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-4 border-white shadow-lg transition-transform group-hover:scale-[1.02]">
                <AvatarImage src={profileImageUrl} alt="Profile" className="object-cover" />
                <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                  {user?.fullName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>

              {editMode && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-900/50 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-7 w-7 text-white" />
                </div>
              )}

              <Input
                ref={fileInputRef}
                id="profile-image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={isSubmitting || !editMode}
              />
            </div>

            {/* Title, Status & User Identifier */}
            <div className="space-y-2 pb-1 min-w-0 flex-1 flex flex-col items-center sm:items-start">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight break-all max-w-full">
                  {user?.fullName || userIdentifier}
                </h2>

                {/* Status Dot Badge */}
                <Badge
                  variant="outline"
                  className={`px-2.5 py-0.5 text-xs font-semibold rounded-full flex items-center gap-1.5 border shrink-0 ${
                    isUserActive
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isUserActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                    }`}
                  />
                  {user?.userStatus || "ACTIVE"}
                </Badge>
              </div>

              {/* Prominent User Identifier Badge */}
              <div className="flex justify-center sm:justify-start w-full">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-orange-50/80 text-orange-700 border border-orange-200/80 text-xs font-semibold shadow-2xs max-w-full truncate">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
                  <span className="text-slate-600 font-medium">User Identifier:</span>
                  <strong className="font-bold text-slate-900 truncate">{userIdentifier}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Action Button — Full width on mobile */}
          <div className="pt-2 sm:pt-0 w-full sm:w-auto">
            <Button
              variant={editMode ? "outline" : "default"}
              size="sm"
              onClick={toggleEditMode}
              disabled={isSubmitting}
              className={`h-10 px-5 w-full sm:w-auto text-xs font-semibold rounded-xl gap-2 transition-all shadow-2xs justify-center ${
                editMode
                  ? "border-slate-300 text-slate-700 hover:bg-slate-100"
                  : "bg-primary text-white hover:bg-primary/90 shadow-primary/20"
              }`}
            >
              {editMode ? (
                <>
                  <X className="h-4 w-4 shrink-0" /> Cancel Edit
                </>
              ) : (
                <>
                  <Edit3 className="h-4 w-4 shrink-0" /> Edit Profile
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Metadata Footer Bar — Stacked on mobile with primary icons */}
        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2.5 sm:gap-6 mt-5 pt-4 border-t border-slate-100 text-xs font-medium text-slate-600">
          {user?.email && (
            <div className="flex items-center gap-2 max-w-full">
              <Mail className="h-4 w-4 text-primary shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary shrink-0" />
            <span>
              Joined{" "}
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "Recently"}
            </span>
          </div>
          {user?.lastLogin && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary shrink-0" />
              <span>Last Login {DateTimeFormat(user.lastLogin)}</span>
            </div>
          )}
        </div>

        {imageData && editMode && (
          <div className="mt-3.5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-medium flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>New profile image selected — Click "Save Changes" below to submit.</span>
          </div>
        )}
      </div>
    </div>
  );
}
