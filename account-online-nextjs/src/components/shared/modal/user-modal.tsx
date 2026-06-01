"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff, UserPlus, UserCog, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getUserByIdService } from "@/services/dashboard/user/user.service";
import { UserModel } from "@/models/user/user.response";
import {
  CreateUserSchema,
  UpdateUserSchema,
  CreateUserForm,
  UpdateUserForm,
} from "@/models/user/user.schema";
import { CreateUserReq, UpdateUserReq } from "@/models/user/user.request";
import Loading from "@/components/shared/common/loading";
import { ModalMode } from "@/constants/AppResource/display-list/enum/mode";
import { ROLE_FILTER } from "@/constants/AppResource/filter/role";
import { STATUS_USER_OPTIONS } from "@/constants/AppResource/filter/status";
import { Status } from "@/constants/AppResource/display-list/enum/status";

type ModalUserProps = {
  isOpen: boolean;
  onClose: () => void;
  mode: ModalMode;
  userId?: number;
  isSubmitting?: boolean;
  error?: string | null;
  onSave: (data: CreateUserReq | { id: number; updates: UpdateUserReq }) => void;
};

function SectionHeader({ color, title }: { color: string; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-1 h-6 ${color} rounded-full`} />
      <h3 className="text-base font-semibold">{title}</h3>
    </div>
  );
}

export default function ModalUser({
  isOpen,
  onClose,
  mode,
  userId,
  onSave,
  isSubmitting = false,
  error = null,
}: ModalUserProps) {
  const isCreate = mode === ModalMode.CREATE_MODE;

  const [showPassword, setShowPassword] = useState(false);
  const [userDetail, setUserDetail] = useState<UserModel | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const form = useForm<CreateUserForm | UpdateUserForm>({
    resolver: zodResolver(isCreate ? CreateUserSchema : UpdateUserSchema),
    defaultValues: isCreate
      ? {
          username: "",
          email: "",
          password: "",
          fullName: "",
          role: ROLE_FILTER[0]?.value || "",
          position: "",
          staffId: "",
          phoneNumber: "",
          branch: "",
          department: "",
        }
      : undefined,
  });

  const { control, handleSubmit, reset, formState: { errors, isDirty } } = form;

  const loadUserById = useCallback(async () => {
    if (!userId || isCreate) return;
    setIsLoadingData(true);
    try {
      const user = await getUserByIdService(userId);
      setUserDetail(user);
      reset({
        id: user.id,
        email: user.email || "",
        fullName: user.fullName || "",
        status: user.userStatus || Status.ACTIVE,
        position: user.position || "",
        profileUrl: user.profileUrl || "",
        staffId: user.staffId || "",
        phoneNumber: user.phoneNumber || "",
        branch: user.branch || "",
        department: user.department || "",
        userRole: user.userRole || ROLE_FILTER[0]?.value || "",
      });
    } catch (err) {
      console.error("Failed to fetch user:", err);
    } finally {
      setIsLoadingData(false);
    }
  }, [userId, isCreate, reset]);

  useEffect(() => {
    if (isOpen && !isCreate) {
      loadUserById();
    }
    if (isOpen && isCreate) {
      reset({
        username: "",
        email: "",
        password: "",
        fullName: "",
        role: ROLE_FILTER[0]?.value || "",
        position: "",
        staffId: "",
        phoneNumber: "",
        branch: "",
        department: "",
      });
      setUserDetail(null);
    }
  }, [isOpen, isCreate, loadUserById, reset]);

  const onSubmit = (data: CreateUserForm | UpdateUserForm) => {
    if (isCreate) {
      onSave(data as CreateUserReq);
    } else {
      const u = data as UpdateUserForm;
      if (!u.id) return;
      const payload: UpdateUserReq = {
        email: u.email?.trim(),
        fullName: u.fullName?.trim(),
        status: u.status,
        position: u.position?.trim(),
        staffId: u.staffId?.trim(),
        phoneNumber: u.phoneNumber?.trim(),
        branch: u.branch?.trim(),
        department: u.department?.trim(),
        userRole: u.userRole,
      };
      onSave({ id: u.id, updates: payload });
    }
  };

  const handleClose = () => {
    reset();
    setUserDetail(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 gap-0 flex flex-col">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-4 pr-8">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isCreate ? "bg-green-100" : "bg-blue-100"}`}>
              {isCreate
                ? <UserPlus className="h-6 w-6 text-green-600" />
                : <UserCog className="h-6 w-6 text-blue-600" />}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold">
                {isCreate ? "Create New User" : "Edit User"}
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                {isCreate
                  ? "Fill in the details to create a new user account"
                  : userDetail
                  ? `Update information for "${userDetail.fullName || userDetail.email}"`
                  : "Loading user information..."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6">
            {isLoadingData ? (
              <Loading />
            ) : !isCreate && !userDetail ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No user data available</p>
              </div>
            ) : (
              <div className="space-y-6">
                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <p className="text-sm text-destructive font-medium">{error}</p>
                  </div>
                )}

                {!isCreate && (
                  <Controller control={control} name="id" render={({ field }) => <input type="hidden" {...field} />} />
                )}

                {/* Account Credentials */}
                <div className="space-y-4">
                  <SectionHeader color="bg-blue-600" title="Account Credentials" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Username */}
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-sm font-medium">
                        Username (ID Card){isCreate && <span className="text-red-500"> *</span>}
                      </Label>
                      {isCreate ? (
                        <Controller
                          control={control}
                          name="username"
                          render={({ field }) => (
                            <Input {...field} id="username" autoComplete="off" placeholder="Enter your username"
                              disabled={isSubmitting}
                              className={`h-10 ${(errors as any).username ? "border-red-500" : ""}`} />
                          )}
                        />
                      ) : (
                        <Input value={userDetail?.idCard?.split("@")[0] || ""} disabled className="h-10 bg-muted/50 cursor-not-allowed" />
                      )}
                      {(errors as any).username && (
                        <p className="text-xs text-red-600">{(errors as any).username.message}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email{isCreate && <span className="text-red-500"> *</span>}
                      </Label>
                      <Controller
                        control={control}
                        name="email"
                        render={({ field }) => (
                          <Input {...field} id="email" type="email" autoComplete="off"
                            placeholder="Enter your email"
                            disabled={isSubmitting} className={`h-10 ${errors.email ? "border-red-500" : ""}`} />
                        )}
                      />
                      {errors.email && <p className="text-xs text-red-600">{errors.email.message as string}</p>}
                    </div>

                    {/* Password (create only) */}
                    {isCreate && (
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium">
                          Password <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Controller
                            control={control}
                            name="password"
                            render={({ field }) => (
                              <Input {...field} id="password" autoComplete="new-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password" disabled={isSubmitting}
                                className={`h-10 pr-10 ${(errors as any).password ? "border-red-500" : ""}`} />
                            )}
                          />
                          <button type="button" tabIndex={-1}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowPassword(p => !p)}>
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {(errors as any).password && (
                          <p className="text-xs text-red-600">{(errors as any).password.message}</p>
                        )}
                      </div>
                    )}

                    {/* Role */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Role{isCreate && <span className="text-red-500"> *</span>}
                      </Label>
                      <Controller
                        control={control}
                        name={isCreate ? "role" : "userRole"}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              {ROLE_FILTER.map((r) => (
                                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    {/* Status (edit only) */}
                    {!isCreate && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Status</Label>
                        <Controller
                          control={control}
                          name="status"
                          render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                {STATUS_USER_OPTIONS.map((s) => (
                                  <SelectItem key={s.value} value={s.value}>
                                    <div className="flex items-center gap-2">
                                      <div className={`w-2 h-2 rounded-full ${s.value === Status.ACTIVE ? "bg-green-500" : "bg-gray-400"}`} />
                                      {s.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Personal Information */}
                <div className="space-y-4">
                  <SectionHeader color="bg-purple-600" title="Personal Information" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Full Name</Label>
                      <Controller control={control} name="fullName"
                        render={({ field }) => (
                          <Input {...field} autoComplete="off" placeholder="Enter your full name" disabled={isSubmitting} className="h-10" />
                        )} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Phone Number</Label>
                      <Controller control={control} name="phoneNumber"
                        render={({ field }) => (
                          <Input {...field} autoComplete="off" placeholder="Enter your phone number" disabled={isSubmitting} className="h-10" />
                        )} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Position</Label>
                      <Controller control={control} name="position"
                        render={({ field }) => (
                          <Input {...field} autoComplete="off" placeholder="Enter your position" disabled={isSubmitting} className="h-10" />
                        )} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Staff ID</Label>
                      <Controller control={control} name="staffId"
                        render={({ field }) => (
                          <Input {...field} autoComplete="off" placeholder="Enter your staff ID" disabled={isSubmitting} className="h-10" />
                        )} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Branch</Label>
                      <Controller control={control} name="branch"
                        render={({ field }) => (
                          <Input {...field} autoComplete="off" placeholder="Enter your branch" disabled={isSubmitting} className="h-10" />
                        )} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Department</Label>
                      <Controller control={control} name="department"
                        render={({ field }) => (
                          <Input {...field} autoComplete="off" placeholder="Enter your department" disabled={isSubmitting} className="h-10" />
                        )} />
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-muted/30 flex-shrink-0 flex items-center justify-between">
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            {isSubmitting ? (
              <><Loader2 className="h-3 w-3 animate-spin" />{isCreate ? "Creating..." : "Updating..."}</>
            ) : isDirty ? (
              <><div className="w-2 h-2 bg-orange-500 rounded-full" />Unsaved changes</>
            ) : (
              <><div className="w-2 h-2 bg-green-500 rounded-full" />{isCreate ? "Ready to create" : "No changes"}</>
            )}
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting || (!isCreate && !isDirty)} className="min-w-[120px]">
              {isSubmitting
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isCreate ? "Creating..." : "Updating..."}</>
                : isCreate ? "Create User" : "Update User"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
