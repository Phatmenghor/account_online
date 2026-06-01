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
import { UserModel } from "@/models/user/user.response";
import { UpdateUserProfileForm } from "@/models/auth/profile.schema";
import { Image } from "@/app/(dashboard)/profile/page";
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
    { name: "username", label: "Username" },
    { name: "email", label: "Email" },
    { name: "fullName", label: "Full Name" },
    { name: "position", label: "Position" },
    { name: "staffId", label: "Staff ID" },
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
        staffId: user.staffId || "",
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
          {/* Profile Banner */}
          <Card className="md:col-span-12 overflow-hidden border-enhanced">
            <div className="h-24 bg-gradient-to-r from-primary/90 to-primary/70 dark:from-primary/80 dark:to-primary/60" />
            <CardContent className="relative pt-0">
              <div className="flex flex-col md:flex-row gap-6 -mt-12 items-start">
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
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-bold">{user?.fullName}</h2>
                    </div>
                    <div className="mt-3 md:mt-0 flex items-center gap-3">
                      <Button
                        variant={editMode ? "outline" : "secondary"}
                        size="sm"
                        onClick={toggleEditMode}
                        disabled={isSubmitting}
                        className="gap-1.5"
                      >
                        {editMode ? (
                          <>
                            <X className="h-4 w-4" /> Cancel
                          </>
                        ) : (
                          <>
                            <Edit3 className="h-4 w-4" /> Edit Profile
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-4 w-4" />
                      {user?.email || "username@example.com"}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      Joined{" "}
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "Recently"}
                    </div>
                    {user?.lastLogin && (
                      <div className="flex items-center gap-1.5">
                        <Info className="h-4 w-4" />
                        Last Login {DateTimeFormat(user.lastLogin)}
                      </div>
                    )}
                  </div>

                  {imageData && editMode && (
                    <p className="mt-4 text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-1.5">
                      <Info className="h-4 w-4" /> New profile image selected -
                      Click Save Changes
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Form */}
          <Card className="md:col-span-12 border-enhanced">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    {editMode
                      ? "Edit your account information and profile details."
                      : "View your account information and profile details."}
                  </CardDescription>
                </div>
                {editMode && (
                  <Badge variant="secondary" className="gap-1">
                    <Edit3 className="h-3 w-3" /> Edit Mode
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="mb-5">
              <Form {...form}>
                <form onSubmit={handleSubmit(submitForm)} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    {formFields.map(({ name, label }) => (
                      <FormField
                        key={name}
                        control={control}
                        name={name}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{label}</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                value={field.value as string ?? ""}
                                readOnly={
                                  !editMode || readOnlyFields.includes(name)
                                }
                                disabled={isSubmitting}
                                className={
                                  readOnlyFields.includes(name)
                                    ? "bg-muted/50"
                                    : ""
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>

                  {editMode && (
                    <div className="flex justify-end gap-3 pt-6 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={toggleEditMode}
                        disabled={isSubmitting}
                        className="gap-1"
                      >
                        <X className="h-4 w-4" /> Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="gap-1 btn-primary"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />{" "}
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" /> Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </form>
              </Form>
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
