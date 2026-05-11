// Updated ModalUser with improved spacing for UX
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff, UserPlus, UserCog, Loader2 } from "lucide-react";
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
import { UserPermission } from "@/constants/AppResource/display-list/enum/user";
import { USER_PERMISSION_OPTIONS } from "@/constants/AppResource/filter/permission";

type ModalUserProps = {
  isOpen: boolean;
  onClose: () => void;
  mode: ModalMode;
  userId?: number;
  isSubmitting?: boolean;
  error?: string | null;
  onSave: (
    data: CreateUserReq | { id: number; updates: UpdateUserReq }
  ) => void;
};

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
          userPermission: UserPermission.NORMAL,
          role: ROLE_FILTER[0]?.value || "",
          position: "",
          profileUrl: "",
          status: Status.ACTIVE,
        }
      : undefined,
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = form;

  const loadUserById = useCallback(async () => {
    if (!userId || isCreate) return;

    setIsLoadingData(true);
    try {
      const user = await getUserByIdService(userId);
      setUserDetail(user);
      reset({
        id: user.id,
        username: user.idCard || "",
        email: user.email || "",
        fullName: user.fullName || "",
        status: user.userStatus || STATUS_USER_OPTIONS[0]?.value,
        userPermission: user.userPermission || UserPermission.NORMAL,
        position: user.position || "",
        profileUrl: user.profileUrl || "",
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
        userPermission: UserPermission.NORMAL,
        fullName: "",
        role: ROLE_FILTER[0]?.value || "",
        position: "",
        profileUrl: "",
        status: Status.ACTIVE,
      });
      setUserDetail(null);
    }
  }, [isOpen, isCreate, loadUserById, reset]);

  const onSubmit = (data: CreateUserForm | UpdateUserForm) => {
    if (isCreate) {
      const payload: CreateUserReq = data as CreateUserForm;
      onSave(payload);
    } else {
      const updateData = data as UpdateUserForm;
      if (!updateData.id) return console.error("Missing ID for update");

      const payload: UpdateUserReq = {
        username: updateData.username?.trim(),
        email: updateData.email?.trim(),
        fullName: updateData.fullName?.trim(),
        status: updateData.status,
        userPermission: updateData.userPermission ?? UserPermission.NORMAL,
        position: updateData.position?.trim(),
        profileUrl: updateData.profileUrl?.trim(),
      };
      onSave({ id: updateData.id, updates: payload });
    }
  };

  const handleClose = () => {
    reset();
    setUserDetail(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl w-full max-h-[90vh] p-0 flex flex-col gap-0">
        <DialogHeader className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-4 pr-8">
            <div
              className={`p-2 rounded-full ${
                isCreate ? "bg-green-100" : "bg-blue-100"
              }`}
            >
              {isCreate ? (
                <UserPlus className="h-5 w-5 text-green-600" />
              ) : (
                <UserCog className="h-5 w-5 text-blue-600" />
              )}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold">
                {isCreate ? "Create New User" : "Edit User"}
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                {isCreate
                  ? "Fill in the details to create a new user account"
                  : userDetail
                  ? `Update information for "${
                      userDetail.fullName || userDetail.email
                    }"`
                  : "Loading user information..."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-auto">
          <div className="p-6 space-y-8">
            {isLoadingData ? (
              <Loading />
            ) : !isCreate && !userDetail ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No user data available</p>
              </div>
            ) : (
              <div className="space-y-6">
                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md mt-2">
                    <p className="text-sm text-destructive font-medium">
                      {error}
                    </p>
                  </div>
                )}

                {!isCreate && (
                  <Controller
                    control={control}
                    name="id"
                    render={({ field }) => <input type="hidden" {...field} />}
                  />
                )}

                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {isCreate && (
                      <div className="space-y-2">
                        <Label
                          htmlFor="username"
                          className="text-sm font-medium"
                        >
                          Username (ID Card)
                          <span className="text-red-500"> *</span>
                        </Label>
                        <Controller
                          control={control}
                          name="username"
                          render={({ field }) => (
                            <Input
                              {...field}
                              id="username"
                              placeholder="Enter username (e.g., 5589)"
                              disabled={isSubmitting}
                              className={`transition-colors h-10 ${
                                errors.username ? "border-red-500" : ""
                              }`}
                            />
                          )}
                        />
                        {errors.username && (
                          <p className="text-sm text-red-600">
                            {errors.username.message as string}
                          </p>
                        )}
                      </div>
                    )}

                    {!isCreate && userDetail && (
                      <div className="space-y-2">
                        <Label
                          htmlFor="username-readonly"
                          className="text-sm font-medium"
                        >
                          Username (ID Card)
                        </Label>
                        <Input
                          id="username-readonly"
                          value={userDetail.idCard || "Not provided"}
                          disabled
                          className="bg-muted/50 cursor-not-allowed h-10"
                        />
                        <p className="text-xs text-muted-foreground">
                          Username cannot be modified
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email{" "}
                        {isCreate && <span className="text-red-500">*</span>}
                      </Label>
                      <Controller
                        control={control}
                        name="email"
                        render={({ field }) => (
                          <Input
                            {...field}
                            id="email"
                            type="email"
                            placeholder="Enter official email address"
                            disabled={isSubmitting}
                            className={`transition-colors h-10 ${
                              errors.email ? "border-red-500" : ""
                            }`}
                          />
                        )}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-600">
                          {errors.email.message as string}
                        </p>
                      )}
                    </div>
                  </div>

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
                            <Input
                              {...field}
                              id="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Create a secure password (min. 8 characters)"
                              disabled={isSubmitting}
                              className={`transition-colors pr-10 h-10 ${
                                (errors as any).password ? "border-red-500" : ""
                              }`}
                            />
                          )}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => setShowPassword((p) => !p)}
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {(errors as any).password && (
                        <p className="text-sm text-red-600">
                          {(errors as any).password.message as string}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-sm font-medium">
                        Full Name
                      </Label>
                      <Controller
                        control={control}
                        name="fullName"
                        render={({ field }) => (
                          <Input
                            {...field}
                            id="fullName"
                            placeholder="Enter your full name"
                            disabled={isSubmitting}
                            className="transition-colors h-10"
                          />
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="position" className="text-sm font-medium">
                        Position
                      </Label>
                      <Controller
                        control={control}
                        name="position"
                        render={({ field }) => (
                          <Input
                            {...field}
                            id="position"
                            placeholder="Enter your position (e.g., Branch Officer)"
                            disabled={isSubmitting}
                            className="transition-colors h-10"
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="userPermission"
                        className="text-sm font-medium"
                      >
                        User Permission{" "}
                        {isCreate && <span className="text-red-500">*</span>}
                      </Label>
                      <Controller
                        control={control}
                        name="userPermission"
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={isSubmitting}
                          >
                            <SelectTrigger
                              id="userPermission"
                              className="transition-colors h-10"
                            >
                              <SelectValue placeholder="Select user permission" />
                            </SelectTrigger>
                            <SelectContent>
                              {USER_PERMISSION_OPTIONS.map((r) => (
                                <SelectItem key={r.value} value={r.value}>
                                  {r.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.userPermission && (
                        <p className="text-sm text-red-600">
                          {errors.userPermission.message as string}
                        </p>
                      )}
                    </div>

                    {isCreate && (
                      <div className="space-y-2">
                        <Label htmlFor="role" className="text-sm font-medium">
                          Role
                        </Label>
                        <Controller
                          control={control}
                          name="role"
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                              disabled={isSubmitting}
                            >
                              <SelectTrigger
                                id="role"
                                className="transition-colors h-10"
                              >
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                {ROLE_FILTER.map((r) => (
                                  <SelectItem key={r.value} value={r.value}>
                                    {r.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    )}

                    {!isCreate && (
                      <div className="space-y-2">
                        <Label htmlFor="status" className="text-sm font-medium">
                          Status <span className="text-red-500">*</span>
                        </Label>
                        <Controller
                          control={control}
                          name="status"
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                              disabled={isSubmitting}
                            >
                              <SelectTrigger
                                id="status"
                                className="transition-colors h-10"
                              >
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                {STATUS_USER_OPTIONS.map((s) => (
                                  <SelectItem key={s.value} value={s.value}>
                                    <div className="flex items-center gap-2">
                                      <div
                                        className={`w-2 h-2 rounded-full ${
                                          s.value === Status.ACTIVE
                                            ? "bg-green-500"
                                            : "bg-gray-400"
                                        }`}
                                      ></div>
                                      {s.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.status && (
                          <p className="text-sm text-red-600">
                            {errors.status.message as string}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center p-6 border-t bg-muted/30 flex-shrink-0 gap-4">
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            {isSubmitting ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                {isCreate ? "Creating user..." : "Updating user..."}
              </>
            ) : isDirty ? (
              <>
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                You have unsaved changes
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                {isCreate ? "Ready to create" : "No changes made"}
              </>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting || (!isCreate && !isDirty)}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isCreate ? "Creating..." : "Updating..."}
                </>
              ) : isCreate ? (
                "Create User"
              ) : (
                "Update User"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
