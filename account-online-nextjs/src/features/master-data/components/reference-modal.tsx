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
  CreateReferenceSchema,
  UpdateReferenceSchema,
  CreateReferenceForm,
  UpdateReferenceForm,
} from "@/features/master-data/types/reference/reference.schema";
import { FileText, FilePenLine, Loader2 } from "lucide-react";
import Loading from "@/components/shared/common/loading";
import { ModalMode } from "@/constants/AppResource/display-list/enum/mode";
import {
  CreateReferenceReq,
  UpdateReferenceReq,
} from "@/features/master-data/types/reference/reference.request";
import { ReferenceModel } from "@/features/master-data/types/reference/reference.response";
import { Status } from "@/constants/AppResource/display-list/enum/status";
import { getReferenceByIdService } from "@/features/master-data/services/reference/reference.service";
import { STATUS_USER_OPTIONS } from "@/constants/AppResource/filter/status";

type ModalReferenceProps = {
  isOpen: boolean;
  onClose: () => void;
  mode: ModalMode;
  referenceId?: number;
  isSubmitting?: boolean;
  error?: string | null;
  onSave: (
    data: CreateReferenceReq | { id: number; updates: UpdateReferenceReq }
  ) => void;
};

export default function ModalReference({
  isOpen,
  onClose,
  mode,
  referenceId,
  onSave,
  isSubmitting = false,
  error = null,
}: ModalReferenceProps) {
  const isCreate = mode === ModalMode.CREATE_MODE;

  const [referenceDetail, setReferenceDetail] = useState<ReferenceModel | null>(
    null
  );
  const [isLoadingData, setIsLoadingData] = useState(false);

  const form = useForm<CreateReferenceForm | UpdateReferenceForm>({
    resolver: zodResolver(
      isCreate ? CreateReferenceSchema : UpdateReferenceSchema
    ),
    defaultValues: isCreate
      ? {
          nameEn: "",
          nameKh: "",
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

  const loadReferenceById = useCallback(async () => {
    if (!referenceId || isCreate) return;

    setIsLoadingData(true);
    try {
      const reference = await getReferenceByIdService(referenceId);
      setReferenceDetail(reference);
      reset({
        id: reference.id,
        nameEn: reference.nameEn || "",
        nameKh: reference.nameKh || "",
        status: reference.status || Status.ACTIVE,
      });
    } catch (err) {
      console.error("Failed to fetch reference:", err);
    } finally {
      setIsLoadingData(false);
    }
  }, [referenceId, isCreate, reset]);

  useEffect(() => {
    if (isOpen && !isCreate) {
      loadReferenceById();
    }
    if (isOpen && isCreate) {
      reset({
        nameEn: "",
        nameKh: "",
        status: Status.ACTIVE,
      });
      setReferenceDetail(null);
    }
  }, [isOpen, isCreate, loadReferenceById, reset]);

  const onSubmit = (data: CreateReferenceForm | UpdateReferenceForm) => {
    if (isCreate) {
      const payload: CreateReferenceReq = data as CreateReferenceForm;
      onSave(payload);
    } else {
      const updateData = data as UpdateReferenceForm;
      if (!updateData.id) return console.error("Missing ID for update");

      const payload: UpdateReferenceReq = {
        nameEn: updateData.nameEn?.trim(),
        nameKh: updateData.nameKh?.trim(),
        status: updateData.status,
      };
      onSave({ id: updateData.id, updates: payload });
    }
  };

  const handleClose = () => {
    reset();
    setReferenceDetail(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[750px] w-full max-h-[90vh] overflow-hidden p-0 flex flex-col gap-0">
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
                {isCreate ? "Create New Reference" : "Edit Reference"}
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                {isCreate
                  ? "Fill in the details to create a new reference"
                  : referenceDetail
                  ? `Update information for "${
                      referenceDetail.nameEn || referenceDetail.nameKh
                    }"`
                  : "Loading reference information..."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-auto">
          <div className="px-6 pb-6 pt-4  space-y-8">
            {/* Loading State */}
            {isLoadingData ? (
              <Loading />
            ) : !isCreate && !referenceDetail ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No reference data available
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
                            placeholder="Enter name in english"
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
                            placeholder="Enter name in khmer"
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
                  </div>
                </div>

                {/* Status Section - Edit Mode Only */}
                {!isCreate && (
                  <div className="space-y-4">
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
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-muted/30 flex-shrink-0 gap-4">
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            {isSubmitting ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                {isCreate ? "Creating bank..." : "Updating bank..."}
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
                "Create Bank"
              ) : (
                "Update Bank"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


