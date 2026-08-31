"use client";

import React, { useState, useRef } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { UseFormReturn } from "react-hook-form";
import { UserModel } from "@/features/user/types/user.response";
import { UpdateUserProfileForm } from "@/features/auth/types/profile.schema";
import { Status } from "@/constants/AppResource/display-list/enum/status";

import { ProfileHeaderCard } from "./profile-header-card";
import { ProfileInfoGrid } from "./profile-info-grid";
import { ProfileEditForm } from "./profile-edit-form";
import { ProfilePhotoModal } from "./profile-photo-modal";

export interface Image {
  type: string;
  base64: string;
}

interface Props {
  tabValue: string;
  handleAvatarClick: () => void;
  user?: UserModel | null;
  imagePreview: string | null;
  form: UseFormReturn<UpdateUserProfileForm>;
  imageData: Image | null;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onProfileSubmit: (values: UpdateUserProfileForm) => void;
  fileInputRef: React.LegacyRef<HTMLInputElement> | undefined;
}

export default function ProfileTab({
  tabValue,
  fileInputRef,
  onProfileSubmit,
  imagePreview,
  imageData,
  form,
  handleImageUpload,
  user,
  handleAvatarClick,
}: Props) {
  const [editMode, setEditMode] = useState(false);
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);
  const openTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    reset,
    formState: { isSubmitting },
  } = form;

  const profileImageUrl =
    imagePreview ||
    (user?.profileUrl
      ? user.profileUrl.startsWith("http")
        ? user.profileUrl
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}${user.profileUrl}`
      : "");

  // Photo preview handlers
  const handlePhotoMouseEnter = () => {
    if (editMode) return;
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    openTimeoutRef.current = setTimeout(() => {
      setShowPhotoPreview(true);
    }, 600);
  };

  const handlePhotoMouseLeave = () => {
    if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      setShowPhotoPreview(false);
    }, 100);
  };

  const handleClosePreview = () => {
    if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setShowPhotoPreview(false);
  };

  const handlePreviewMouseEnter = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
  };

  const resetFormToUser = () => {
    if (!user) return;
    reset(
      {
        username: user.idCard || "",
        email: user.email || "",
        fullName: user.fullName || "",
        status: user.userStatus || Status.ACTIVE,
        position: user.position || "",
        profileUrl: user.profileUrl || "",
        phoneNumber: user.phoneNumber || "",
        branch: user.branch || "",
        department: user.department || "",
        id: user.id || 0,
      },
      { keepDefaultValues: true }
    );
  };

  const toggleEditMode = () => {
    if (editMode) {
      resetFormToUser();
      setEditMode(false);
    } else {
      setEditMode(true);
    }
  };

  const submitForm = async (values: UpdateUserProfileForm) => {
    try {
      await onProfileSubmit(values);
      setEditMode(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <>
      <TabsContent value={tabValue} className="space-y-6 mt-4 focus-visible:outline-none">
        {/* Modular Header Card */}
        <ProfileHeaderCard
          user={user}
          profileImageUrl={profileImageUrl}
          editMode={editMode}
          isSubmitting={isSubmitting}
          imageData={imageData}
          fileInputRef={fileInputRef}
          toggleEditMode={toggleEditMode}
          handleAvatarClick={handleAvatarClick}
          handleImageUpload={handleImageUpload}
          handlePhotoMouseEnter={handlePhotoMouseEnter}
          handlePhotoMouseLeave={handlePhotoMouseLeave}
        />

        {/* Content Body: Read-Only Info Grid OR Edit Form */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          {!editMode ? (
            <ProfileInfoGrid user={user} />
          ) : (
            <ProfileEditForm
              form={form}
              user={user}
              isSubmitting={isSubmitting}
              toggleEditMode={toggleEditMode}
              submitForm={submitForm}
            />
          )}
        </div>
      </TabsContent>

      {/* Photo Preview Modal */}
      <ProfilePhotoModal
        profileImageUrl={profileImageUrl}
        showPhotoPreview={showPhotoPreview}
        editMode={editMode}
        fullName={user?.fullName}
        handleClosePreview={handleClosePreview}
        handlePreviewMouseEnter={handlePreviewMouseEnter}
        handlePhotoMouseLeave={handlePhotoMouseLeave}
      />
    </>
  );
}
