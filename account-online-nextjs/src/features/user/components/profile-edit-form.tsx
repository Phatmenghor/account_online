"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, Loader2, X, Edit3, User, Mail, Phone, Briefcase, Building2, Landmark } from "lucide-react";
import { UpdateUserProfileForm } from "@/features/auth/types/profile.schema";
import { UserModel } from "@/features/user/types/user.response";

interface ProfileEditFormProps {
  form: UseFormReturn<UpdateUserProfileForm>;
  user?: UserModel | null;
  isSubmitting: boolean;
  toggleEditMode: () => void;
  submitForm: (values: UpdateUserProfileForm) => Promise<void>;
}

export function ProfileEditForm({
  form,
  user,
  isSubmitting,
  toggleEditMode,
  submitForm,
}: ProfileEditFormProps) {
  const { control, handleSubmit } = form;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
        <div>
          <h3 className="text-base font-bold text-slate-900">Update Profile Information</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Modify your editable profile details below and click Save Changes.
          </p>
        </div>
        <Badge variant="secondary" className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 gap-1.5 shrink-0">
          <Edit3 className="h-3.5 w-3.5" /> Edit Mode
        </Badge>
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit(submitForm)} className="space-y-6">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            {/* Full Name */}
            <FormField
              control={control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-primary shrink-0" /> Full Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={(field.value as string) ?? ""}
                      disabled={isSubmitting}
                      placeholder="Enter full name"
                      className="h-10 text-xs sm:text-sm rounded-xl"
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-rose-500" />
                </FormItem>
              )}
            />

            {/* Email Address */}
            <FormField
              control={control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-primary shrink-0" /> Email Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      value={(field.value as string) ?? ""}
                      disabled={isSubmitting}
                      placeholder="Enter email address"
                      className="h-10 text-xs sm:text-sm rounded-xl"
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-rose-500" />
                </FormItem>
              )}
            />

            {/* Phone Number */}
            <FormField
              control={control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-primary shrink-0" /> Phone Number
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={(field.value as string) ?? ""}
                      disabled={isSubmitting}
                      placeholder="Enter phone number"
                      className="h-10 text-xs sm:text-sm rounded-xl"
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-rose-500" />
                </FormItem>
              )}
            />

            {/* Position */}
            <FormField
              control={control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-primary shrink-0" /> Position
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={(field.value as string) ?? ""}
                      disabled={isSubmitting}
                      placeholder="Enter position"
                      className="h-10 text-xs sm:text-sm rounded-xl"
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-rose-500" />
                </FormItem>
              )}
            />

            {/* Branch */}
            <FormField
              control={control}
              name="branch"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-primary shrink-0" /> Branch
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={(field.value as string) ?? ""}
                      disabled={isSubmitting}
                      placeholder="Enter branch"
                      className="h-10 text-xs sm:text-sm rounded-xl"
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-rose-500" />
                </FormItem>
              )}
            />

            {/* Department */}
            <FormField
              control={control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Landmark className="h-3.5 w-3.5 text-primary shrink-0" /> Department
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={(field.value as string) ?? ""}
                      disabled={isSubmitting}
                      placeholder="Enter department"
                      className="h-10 text-xs sm:text-sm rounded-xl"
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-rose-500" />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2.5 sm:gap-3 pt-5 border-t border-slate-200/80">
            <Button
              type="button"
              variant="outline"
              onClick={toggleEditMode}
              disabled={isSubmitting}
              className="h-9.5 px-4 w-full sm:w-auto text-xs font-semibold rounded-xl gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-100 justify-center"
            >
              <X className="h-4 w-4 shrink-0" /> Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-9.5 px-5 w-full sm:w-auto text-xs font-semibold rounded-xl gap-2 bg-primary hover:bg-primary/90 text-white shadow-sm justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin shrink-0" /> Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 shrink-0" /> Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
