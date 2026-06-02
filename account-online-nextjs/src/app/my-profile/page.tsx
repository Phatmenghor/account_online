"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { User, Key } from "lucide-react";
import { AppToast } from "@/components/shared/toast/app-toast";
import Loading from "@/components/shared/common/loading";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileTab from "@/components/app/profile/profile-tab";
import ChangePasswordTab from "@/components/app/profile/change-password-tab";
import { PageHeader } from "@/components/acc-online/page-header";
import { getUserProfileService } from "@/services/dashboard/user/user.service";
import { updateUserProfileService } from "@/services/auth/login.service";
import { uploadImageService } from "@/services/dashboard/image/image.service";
import { UserModel } from "@/models/user/user.response";
import {
  UpdateUserProfileForm,
  UpdateUserProfileSchema,
} from "@/models/auth/profile.schema";
import { Status } from "@/constants/AppResource/display-list/enum/status";
import { isAuthenticated } from "@/utils/local-storage/token";
import { ROUTES } from "@/constants/AppRoutes/routes";

export interface Image {
  type: string;
  base64: string;
}

export default function MyProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") === "password" ? "password" : "account";

  const [ready, setReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<Image | null>(null);
  const [user, setUser] = useState<UserModel | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace(ROUTES.AUTH.LOGIN);
    } else {
      setReady(true);
    }
  }, [router]);

  const profileForm = useForm<UpdateUserProfileForm>({
    resolver: zodResolver(UpdateUserProfileSchema),
    defaultValues: {
      username: "",
      email: "",
      fullName: "",
      status: Status.ACTIVE,
      position: "",
      profileUrl: "",
      staffId: "",
      phoneNumber: "",
      branch: "",
      department: "",
      id: 0,
    },
  });

  const { handleSubmit, reset, formState } = profileForm;

  useEffect(() => {
    if (!ready) return;
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
            staffId: response.staffId || "",
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
  }, [ready, reset]);

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
        staffId: values.staffId,
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

  if (!ready) return null;
  if (isLoading) return (
    <div className="min-h-screen flex flex-col bg-gray-50/60">
      <PageHeader />
      <div className="flex-1 pt-16 flex items-center justify-center">
        <Loading />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/60">
      <PageHeader />

      <main className="flex-1 pt-16 sm:pt-[60px]">
        <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <h1 className="text-2xl font-bold tracking-tight mb-6">My Profile</h1>

          <Tabs defaultValue={defaultTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="account" className="flex items-center gap-2">
                <User className="h-4 w-4" /> Account
              </TabsTrigger>
              <TabsTrigger value="password" className="flex items-center gap-2">
                <Key className="h-4 w-4" /> Password
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
