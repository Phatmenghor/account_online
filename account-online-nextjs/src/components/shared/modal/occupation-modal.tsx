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
import {
  CreateOccupationSchema,
  UpdateOccupationSchema,
  CreateOccupationForm,
  UpdateOccupationForm,
} from "@/models/static/occupation/occupation.schema";
import { FileText, FilePenLine, Loader2 } from "lucide-react";
import Loading from "@/components/shared/common/loading";
import { ModalMode } from "@/constants/AppResource/display-list/enum/mode";
import {
  CreateOccupationReq,
  UpdateOccupationReq,
} from "@/models/static/occupation/occupation.request";
import { OccupationModel } from "@/models/static/occupation/occupation.response";
import { Status } from "@/constants/AppResource/display-list/enum/status";
import { getOccupationByIdService } from "@/services/dashboard/occupation/occupation.service";
import { STATUS_USER_OPTIONS } from "@/constants/AppResource/filter/status";

type ModalOccupationProps = {
  isOpen: boolean;
  onClose: () => void;
  mode: ModalMode;
  occupationId?: number;
  isSubmitting?: boolean;
  error?: string | null;
  onSave: (
    data: CreateOccupationReq | { id: number; updates: UpdateOccupationReq }
  ) => void;
};

export default function ModalOccupation({
  isOpen,
  onClose,
  mode,
  occupationId,
  onSave,
  isSubmitting = false,
  error = null,
}: ModalOccupationProps) {
  const isCreate = mode === ModalMode.CREATE_MODE;

  const [occupationDetail, setOccupationDetail] =
    useState<OccupationModel | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const form = useForm<CreateOccupationForm | UpdateOccupationForm>({
    resolver: zodResolver(
      isCreate ? CreateOccupationSchema : UpdateOccupationSchema
    ),
    defaultValues: isCreate
      ? {
          nameEn: "",
          nameKh: "",
          occupationCode: "",
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

  const loadOccupationById = useCallback(async () => {
    if (!occupationId || isCreate) return;

    setIsLoadingData(true);
    try {
      const occupation = await getOccupationByIdService(occupationId);
      setOccupationDetail(occupation);
      reset({
        id: occupation.id,
        nameEn: occupation.nameEn || "",
        nameKh: occupation.nameKh || "",
        occupationCode: occupation.occupationCode || "",
        status: occupation.status || Status.ACTIVE,
      });
    } catch (err) {
      console.error("Failed to fetch occupation:", err);
    } finally {
      setIsLoadingData(false);
    }
  }, [occupationId, isCreate, reset]);

  useEffect(() => {
    if (isOpen && !isCreate) {
      loadOccupationById();
    }
    if (isOpen && isCreate) {
      reset({
        nameEn: "",
        nameKh: "",
        occupationCode: "",
        status: Status.ACTIVE,
      });
      setOccupationDetail(null);
    }
  }, [isOpen, isCreate, loadOccupationById, reset]);

  const onSubmit = (data: CreateOccupationForm | UpdateOccupationForm) => {
    if (isCreate) {
      const payload: CreateOccupationReq = data as CreateOccupationForm;
      onSave(payload);
    } else {
      const updateData = data as UpdateOccupationForm;
      if (!updateData.id) return console.error("Missing ID for update");

      const payload: UpdateOccupationReq = {
        nameEn: updateData.nameEn?.trim(),
        nameKh: updateData.nameKh?.trim(),
        occupationCode: updateData.occupationCode?.trim(),
        status: updateData.status,
      };
      onSave({ id: updateData.id, updates: payload });
    }
  };

  const handleClose = () => {
    reset();
    setOccupationDetail(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl w-full max-h-[90vh] p-0 flex flex-col gap-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <div className="flex items-center gap-4 pr-8">
            <div
              className={`p-2 rounded-full ${
                isCreate ? "bg-green-100" : "bg-blue-100"
              }`}
            >
              {isCreate ? (
                <FileText className="h-5 w-5 text-green-600" />
              ) : (
                <FilePenLine className="h-5 w-5 text-blue-600" />
              )}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold">
                {isCreate ? "Create New Occupation" : "Edit Occupation"}
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                {isCreate
                  ? "Fill in the details to create a new occupation"
                  : occupationDetail
                  ? `Update information for "${
                      occupationDetail.nameEn ||
                      occupationDetail.nameKh ||
                      occupationDetail.occupationCode
                    }"`
                  : "Loading occupation information..."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-auto">
          <div className="px-6 pt-4 pb-6 space-y-8">
            {/* Loading State */}
            {isLoadingData ? (
              <Loading />
            ) : !isCreate && !occupationDetail ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No occupation data available
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Error Display */}
                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <p className="text-sm text-destructive font-medium">
                      {error}
                    </p>
                  </div>
                )}

                {/* Hidden ID field for update mode */}
                {!isCreate && (
                  <Controller
                    control={control}
                    name="id"
                    render={({ field }) => <input type="hidden" {...field} />}
                  />
                )}

                {/* Basic Information Section */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name English */}
                    <div className="space-y-2">
                      <Label htmlFor="nameEn" className="text-sm font-medium">
                        Name (English) <span className="text-red-500">*</span>
                      </Label>
                      <Controller
                        control={control}
                        name="nameEn"
                        render={({ field }) => (
                          <Input
                            {...field}
                            id="nameEn"
                            placeholder="Enter your name english"
                            disabled={isSubmitting}
                            className={`transition-colors ${
                              errors.nameEn ? "border-red-500" : ""
                            }`}
                          />
                        )}
                      />
                      {errors.nameEn && (
                        <p className="text-sm text-red-600">
                          {errors.nameEn.message as string}
                        </p>
                      )}
                    </div>

                    {/* Name Khmer */}
                    <div className="space-y-2">
                      <Label htmlFor="nameKh" className="text-sm font-medium">
                        Name (Khmer) <span className="text-red-500">*</span>
                      </Label>
                      <Controller
                        control={control}
                        name="nameKh"
                        render={({ field }) => (
                          <Input
                            {...field}
                            id="nameKh"
                            placeholder="Enter your name khmer"
                            disabled={isSubmitting}
                            className={`transition-colors ${
                              errors.nameKh ? "border-red-500" : ""
                            }`}
                          />
                        )}
                      />
                      {errors.nameKh && (
                        <p className="text-sm text-red-600">
                          {errors.nameKh.message as string}
                        </p>
                      )}
                    </div>

                    {/* Occupation Code */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="occupationCode"
                        className="text-sm font-medium"
                      >
                        Occupation Code <span className="text-red-500">*</span>
                      </Label>
                      <Controller
                        control={control}
                        name="occupationCode"
                        render={({ field }) => (
                          <Input
                            {...field}
                            id="occupationCode"
                            placeholder="Enter occupation code"
                            disabled={isSubmitting}
                            className={`transition-colors ${
                              errors.occupationCode ? "border-red-500" : ""
                            }`}
                          />
                        )}
                      />
                      {errors.occupationCode && (
                        <p className="text-sm text-red-600">
                          {errors.occupationCode.message as string}
                        </p>
                      )}
                    </div>

                    {/* Status Section - Edit Mode Only */}
                    {!isCreate && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="status"
                            className="text-sm font-medium"
                          >
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
                                  className="transition-colors"
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
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-muted/30 flex-shrink-0 gap-4">
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            {isSubmitting ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                {isCreate ? "Creating occupation..." : "Updating occupation..."}
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
                "Create Occupation"
              ) : (
                "Update Occupation"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
