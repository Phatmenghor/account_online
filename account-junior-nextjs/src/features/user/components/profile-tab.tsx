"use client";

import React, { useState, useRef } from "react";
import { TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Calendar,
  Camera,
  Info,
  Loader2,
  Mail,
  Save,
  Edit3,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UseFormReturn } from "react-hook-form";
import { UserModel } from "@/features/user/types/user.response";
import { UpdateUserProfileForm } from "@/features/auth/types/profile.schema";
interface Image {
  file: File | null;
  preview: string | null;
}
import { Status } from "@/constants/AppResource/display-list/enum/status";
import { DateTimeFormat } from "@/utils/date/date-time-format";

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
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;

  const readOnlyFields = ["username", "status"];

  const formFields: { name: keyof UpdateUserProfileForm; label: string }[] = [
    { name: "username", label: "ID Card" },
    { name: "email", label: "Email" },
    { name: "fullName", label: "Full Name" },
    { name: "position", label: "Position" },
    { name: "phoneNumber", label: "Phone Number" },
    { name: "branch", label: "Branch" },
    { name: "department", label: "Department" },
    { name: "status", label: "Status" },
  ];

  const profileImageUrl =
    imagePreview ||
    (user?.profileUrl
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${user.profileUrl}`
      : "");

  // Photo preview handlers
  const handlePhotoMouseEnter = () => {
    if (editMode) return; // Don't show preview in edit mode

    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    openTimeoutRef.current = setTimeout(() => {
      setShowPhotoPreview(true);
    }, 600);
  };

  const handlePhotoMouseLeave = () => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
    }
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
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
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
      <TabsContent value={tabValue}>
        <div className="grid gap-6 md:grid-cols-12">
          {/* Unified Profile & Account Information Card */}
          <Card className="md:col-span-12 overflow-hidden border-enhanced shadow-sm">
            {/* Top Gradient Banner */}
            <div className="h-24 bg-gradient-to-r from-primary/90 to-primary/70 dark:from-primary/80 dark:to-primary/60" />

            <CardContent className="relative pt-0 pb-6">
              {/* Profile Avatar & Header Information */}
              <div className="flex flex-col md:flex-row gap-8 md:gap-10 -mt-12 items-start">
                <div
                  className={`relative group z-10 ${
                    editMode ? "cursor-pointer" : "cursor-default"
                  }`}
                  onClick={editMode ? handleAvatarClick : undefined}
                  onMouseEnter={handlePhotoMouseEnter}
                  onMouseLeave={handlePhotoMouseLeave}
                  role={editMode ? "button" : undefined}
                >
                  <Avatar className="h-28 w-28 border-4 border-background dark:border-card shadow-md transition-all">
                    <AvatarImage src={profileImageUrl} alt="Profile" />
                    <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary dark:bg-primary/20">
                      {user?.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>

                  {editMode && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="h-8 w-8 text-white" />
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

                <div className="flex-1 pt-12 md:pt-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    {/* Line 1: Name and ID Card Badge */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
                          {user?.fullName || user?.idCard || "User Profile"}
                        </h2>
                        {user?.idCard && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                            ID: {user.idCard}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant={editMode ? "outline" : "secondary"}
                        size="sm"
                        onClick={toggleEditMode}
                        disabled={isSubmitting}
                        className="h-8 px-3 text-xs font-semibold rounded-lg gap-1.5"
                      >
                        {editMode ? (
                          <>
                            <X className="h-3.5 w-3.5" /> Cancel
                          </>
                        ) : (
                          <>
                            <Edit3 className="h-3.5 w-3.5" /> Edit Profile
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Line 2: Email, Joined, Last Login metadata */}
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-muted-foreground">
                    {user?.email && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>{user.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span>
                        Joined{" "}
                        {user?.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "Recently"}
                      </span>
                    </div>
                    {user?.lastLogin && (
                      <div className="flex items-center gap-1.5">
                        <Info className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span>Last Login {DateTimeFormat(user.lastLogin)}</span>
                      </div>
                    )}
                  </div>

                  {imageData && editMode && (
                    <p className="mt-3 text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1.5">
                      <Info className="h-3.5 w-3.5" /> New profile image selected — Click Save Changes
                    </p>
                  )}
                </div>
              </div>

              {/* Section Header: Account Information (32px top spacing, no line) */}
              <div className="flex items-center justify-between mt-8 mb-5">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {editMode ? "Update Profile Information" : "Account Information"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {editMode
                      ? "Modify your editable profile information below."
                      : "View your personal account information and organizational details."}
                  </p>
                </div>
                {editMode ? (
                  <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary border-primary/20">
                    <Edit3 className="h-3 w-3" /> Edit Mode
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1">
                    <Info className="h-3 w-3" /> Read Only
                  </Badge>
                )}
              </div>

              {!editMode ? (
                /* ================= VIEW MODE (Disabled Inputs Matching Edit Mode) ================= */
                <div className="py-2">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 block">ID Card</label>
                      <Input
                        value={user?.idCard || "—"}
                        disabled
                        className="h-9 text-xs sm:text-sm rounded-xl bg-gray-50/80 text-gray-800 border-gray-200 cursor-default font-normal"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 block">Full Name</label>
                      <Input
                        value={user?.fullName || "—"}
                        disabled
                        className="h-9 text-xs sm:text-sm rounded-xl bg-gray-50/80 text-gray-800 border-gray-200 cursor-default font-normal"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 block">Email Address</label>
                      <Input
                        value={user?.email || "—"}
                        disabled
                        className="h-9 text-xs sm:text-sm rounded-xl bg-gray-50/80 text-gray-800 border-gray-200 cursor-default font-normal"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 block">Phone Number</label>
                      <Input
                        value={user?.phoneNumber || "—"}
                        disabled
                        className="h-9 text-xs sm:text-sm rounded-xl bg-gray-50/80 text-gray-800 border-gray-200 cursor-default font-normal"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 block">Position</label>
                      <Input
                        value={user?.position || "—"}
                        disabled
                        className="h-9 text-xs sm:text-sm rounded-xl bg-gray-50/80 text-gray-800 border-gray-200 cursor-default font-normal"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 block">Branch</label>
                      <Input
                        value={user?.branch || "—"}
                        disabled
                        className="h-9 text-xs sm:text-sm rounded-xl bg-gray-50/80 text-gray-800 border-gray-200 cursor-default font-normal"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 block">Department</label>
                      <Input
                        value={user?.department || "—"}
                        disabled
                        className="h-9 text-xs sm:text-sm rounded-xl bg-gray-50/80 text-gray-800 border-gray-200 cursor-default font-normal"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 block">Account Status</label>
                      <Input
                        value={user?.userStatus || "ACTIVE"}
                        disabled
                        className="h-9 text-xs sm:text-sm rounded-xl bg-green-50 text-green-700 border-green-200 font-semibold cursor-default"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* ================= EDIT MODE (Show Only Editable Fields) ================= */
                <Form {...form}>
                  <form onSubmit={handleSubmit(submitForm)} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-gray-500">ID Card (Read-only)</FormLabel>
                        <FormControl>
                          <Input
                            value={user?.idCard || "—"}
                            readOnly
                            disabled
                            className="h-9 text-xs sm:text-sm rounded-xl bg-gray-100/80 text-gray-600 border-gray-200 cursor-not-allowed"
                          />
                        </FormControl>
                      </FormItem>

                      <FormField
                        control={control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold">Full Name</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                value={(field.value as string) ?? ""}
                                disabled={isSubmitting}
                                placeholder="Enter full name"
                                className="h-9 text-xs sm:text-sm rounded-xl"
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold">Email Address</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                value={(field.value as string) ?? ""}
                                disabled={isSubmitting}
                                placeholder="Enter email address"
                                className="h-9 text-xs sm:text-sm rounded-xl"
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold">Phone Number</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                value={(field.value as string) ?? ""}
                                disabled={isSubmitting}
                                placeholder="Enter phone number"
                                className="h-9 text-xs sm:text-sm rounded-xl"
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name="position"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold">Position</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                value={(field.value as string) ?? ""}
                                disabled={isSubmitting}
                                placeholder="Enter position"
                                className="h-9 text-xs sm:text-sm rounded-xl"
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name="branch"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold">Branch</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                value={(field.value as string) ?? ""}
                                disabled={isSubmitting}
                                placeholder="Enter branch"
                                className="h-9 text-xs sm:text-sm rounded-xl"
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name="department"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold">Department</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                value={(field.value as string) ?? ""}
                                disabled={isSubmitting}
                                placeholder="Enter department"
                                className="h-9 text-xs sm:text-sm rounded-xl"
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-5 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={toggleEditMode}
                        disabled={isSubmitting}
                        className="h-9 px-4 text-xs font-semibold rounded-xl gap-1"
                      >
                        <X className="h-3.5 w-3.5" /> Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="h-9 px-5 text-xs font-semibold rounded-xl gap-1.5 bg-primary hover:bg-primary/90 text-white"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-3.5 w-3.5" /> Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Photo Preview Modal - Only shows when NOT in edit mode */}
      {profileImageUrl && showPhotoPreview && !editMode && (
        <>
          {/* Dark backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-[9998] animate-in fade-in duration-200"
            onMouseEnter={handlePreviewMouseEnter}
            onClick={handleClosePreview}
          />

          {/* Big photo in center */}
          <div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] animate-in zoom-in-95 fade-in duration-200"
            onMouseEnter={handlePreviewMouseEnter}
            onMouseLeave={handlePhotoMouseLeave}
          >
            <div className="relative bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-2xl border-4 border-primary/30">
              {/* Close Button */}
              <button
                onClick={handleClosePreview}
                className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all hover:scale-110 z-10"
              >
                <X className="h-5 w-5" />
              </button>

              <img
                src={profileImageUrl}
                alt={user?.fullName || "Profile"}
                className="max-w-[70vw] max-h-[70vh] w-auto h-auto object-contain rounded-lg"
              />
              {user?.fullName && (
                <p className="text-lg font-semibold text-center mt-4 text-gray-900 dark:text-white">
                  {user.fullName}
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}


