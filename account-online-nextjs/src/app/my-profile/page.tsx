"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { User, Key } from "lucide-react";
import { AppToast } from "@/components/shared/toast/app-toast";
import Loading from "@/components/shared/common/loading";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileTab from "@/features/user/components/profile-tab";
import ChangePasswordTab from "@/features/user/components/change-password-tab";
import { PageHeader } from "@/features/account-opening/components/page-header";
import { getUserProfileService } from "@/features/user/services/user.service";
import { updateUserProfileService } from "@/features/auth/services/login.service";
import { uploadImageService } from "@/features/account-opening/services/image.service";
import { UserModel } from "@/features/user/types/user.response";
import {
  UpdateUserProfileForm,
  UpdateUserProfileSchema,
} from "@/features/auth/types/profile.schema";
import { Status } from "@/constants/AppResource/display-list/enum/status";
import { Suspense } from "react";

export interface Image {
  type: string;
  base64: string;
}

function MyProfilePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") === "password" ? "password" : "account"
  );

  useEffect(() => {
    setActiveTab(searchParams.get("tab") === "password" ? "password" : "account");
  }, [searchParams]);

  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<Image | null>(null);
  const [user, setUser] = useState<UserModel | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profileForm = useForm<UpdateUserProfileForm>({
    resolver: zodResolver(UpdateUserProfileSchema),
    defaultValues: {
      username: "",
      email: "",
      fullName: "",
      status: Status.ACTIVE,
      position: "",
      profileUrl: "",
      phoneNumber: "",
      branch: "",
      department: "",
      id: 0,
    },
  });

  const { handleSubmit, reset } = profileForm;

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const response: UserModel = await getUserProfileService();
        setUser(response);
        reset(
          {
            username: response.idCard || "",
            email: response.email || "",
            fullName: response.fullName || "",
            status: response.userStatus || Status.ACTIVE,
            position: response.position || "",
            profileUrl: response.profileUrl || "",
            phoneNumber: response.phoneNumber || "",
            branch: response.branch || "",
            department: response.department || "",
            id: response.id,
          },
          { keepDefaultValues: true }
        );
      } catch {
        AppToast({ type: "error", message: "Failed to load profile." });
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [reset]);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      AppToast({ type: "error", message: "File too large, must be <5MB." });
      return;
    }
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === "string") resolve(reader.result.split(",")[1]);
        else reject("Failed to convert");
      };
      reader.onerror = reject;
    });
    setImageData({ type: file.type, base64 });
    setImagePreview(URL.createObjectURL(file));
  };

  const onProfileSubmit = async (values: UpdateUserProfileForm) => {
    try {
      let uploadedProfileUrl = values.profileUrl || "";
      if (imageData) {
        const res = await uploadImageService(imageData);
        if (res?.imageUrl) uploadedProfileUrl = res.imageUrl;
        else throw new Error("Failed to upload image");
      }
      const payload = {
        email: values.email,
        fullName: values.fullName,
        position: values.position,
        status: values.status,
        profileUrl: uploadedProfileUrl,
        phoneNumber: values.phoneNumber,
        branch: values.branch,
        department: values.department,
      };
      const response = await updateUserProfileService(payload);
      if (response) {
        AppToast({ type: "success", message: "Profile updated successfully!" });
        setUser({ ...user!, ...response, profileUrl: uploadedProfileUrl });
        reset({ ...payload, username: values.username, id: user?.id }, { keepDefaultValues: true });
        setImageData(null);
        setImagePreview(null);
      }
    } catch {
      AppToast({ type: "error", message: "Failed to update profile." });
    }
  };

  useEffect(() => {
    return () => { if (imagePreview) URL.revokeObjectURL(imagePreview); };
  }, [imagePreview]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.push(`/my-profile?tab=${value}`, { scroll: false });
  };

  if (isLoading) return (
    <div className="min-h-screen flex flex-col bg-slate-50/70">
      <PageHeader />
      <div className="flex-1 pt-16 flex items-center justify-center">
        <Loading />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70">
      <PageHeader />

      <main className="flex-1 pt-16 sm:pt-[60px]">
        <div className="max-w-5xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-5 sm:space-y-6">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-5">
            {/* Full-width responsive tab bar on mobile */}
            <TabsList className="w-full grid grid-cols-2 bg-slate-200/60 p-1.5 rounded-2xl border border-slate-200/80 shadow-2xs h-auto gap-1">
              <TabsTrigger
                value="account"
                className="flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs sm:text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs transition-all"
              >
                <User className="h-4 w-4 shrink-0 text-primary" />
                <span>Account Details</span>
              </TabsTrigger>
              <TabsTrigger
                value="password"
                className="flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs sm:text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs transition-all"
              >
                <Key className="h-4 w-4 shrink-0 text-primary" />
                <span>Change Password</span>
              </TabsTrigger>
            </TabsList>

            <ProfileTab
              tabValue="account"
              fileInputRef={fileInputRef}
              handleAvatarClick={handleAvatarClick}
              handleImageUpload={handleImageUpload}
              imageData={imageData}
              imagePreview={imagePreview}
              user={user}
              form={profileForm}
              onProfileSubmit={onProfileSubmit}
            />

            <ChangePasswordTab value="password" />
          </Tabs>
        </div>
      </main>
    </div>
  );
}

export default function MyProfilePage() {
  return (
    <Suspense fallback={<Loading />}>
      <MyProfilePageContent />
    </Suspense>
  );
}
