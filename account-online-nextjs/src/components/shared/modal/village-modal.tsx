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
  CreateVillageSchema,
  UpdateVillageSchema,
  CreateVillageForm,
  UpdateVillageForm,
} from "@/models/static/village/village.schema";
import { FileText, FilePenLine, Loader2 } from "lucide-react";
import Loading from "@/components/shared/common/loading";
import { ModalMode } from "@/constants/AppResource/display-list/enum/mode";
import {
  CreateVillageReq,
  UpdateVillageReq,
} from "@/models/static/village/village.request";
import { VillageModel } from "@/models/static/village/village.response";
import { getVillageByIdService } from "@/services/dashboard/village/village.service";

type ModalVillageProps = {
  isOpen: boolean;
  onClose: () => void;
  mode: ModalMode;
  villageId?: number;
  isSubmitting?: boolean;
  error?: string | null;
  onSave: (
    data: CreateVillageReq | { id: number; updates: UpdateVillageReq }
  ) => void;
  communes?: Array<{
    communeCode: string;
    communeEn: string;
    communeKh: string;
  }>;
};

export default function ModalVillage({
  isOpen,
  onClose,
  mode,
  villageId,
  onSave,
  isSubmitting = false,
  error = null,
  communes = [],
}: ModalVillageProps) {
  const isCreate = mode === ModalMode.CREATE_MODE;

  const [villageDetail, setVillageDetail] = useState<VillageModel | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const form = useForm<CreateVillageForm | UpdateVillageForm>({
    resolver: zodResolver(isCreate ? CreateVillageSchema : UpdateVillageSchema),
    defaultValues: isCreate
      ? {
          villageCode: "",
          villageEn: "",
          villageKh: "",
          communeCode: "",
        }
      : undefined,
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = form;

  const loadVillageById = useCallback(async () => {
    if (!villageId || isCreate) return;

    setIsLoadingData(true);
    try {
      const village = await getVillageByIdService(villageId);
      setVillageDetail(village);
      reset({
        id: village.id,
        villageCode: village.villageCode || "",
        villageEn: village.villageEn || "",
        villageKh: village.villageKh || "",
        communeCode: village.commune?.communeCode || "",
      });
    } catch (err) {
      console.error("Failed to fetch village:", err);
    } finally {
      setIsLoadingData(false);
    }
  }, [villageId, isCreate, reset]);

  useEffect(() => {
    if (isOpen && !isCreate) {
      loadVillageById();
    }
    if (isOpen && isCreate) {
      reset({
        villageCode: "",
        villageEn: "",
        villageKh: "",
        communeCode: "",
      });
      setVillageDetail(null);
    }
  }, [isOpen, isCreate, loadVillageById, reset]);

  const onSubmit = (data: CreateVillageForm | UpdateVillageForm) => {
    if (isCreate) {
      const payload: CreateVillageReq = data as CreateVillageForm;
      onSave(payload);
    } else {
      const updateData = data as UpdateVillageForm;
      if (!updateData.id) return console.error("Missing ID for update");

      const payload: UpdateVillageReq = {
        villageCode: updateData.villageCode?.trim(),
        villageEn: updateData.villageEn?.trim(),
        villageKh: updateData.villageKh?.trim(),
        communeCode: updateData.communeCode?.trim(),
      };
      onSave({ id: updateData.id, updates: payload });
    }
  };

  const handleClose = () => {
    reset();
    setVillageDetail(null);
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
                {isCreate ? "Create New Village" : "Edit Village"}
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                {isCreate
                  ? "Fill in the details to create a new village"
                  : villageDetail
                  ? `Update information for "${
                      villageDetail.villageEn || villageDetail.villageKh
                    }"`
                  : "Loading village information..."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-auto">
          <div className="px-6 pb-6 pt-4 space-y-8">
            {/* Loading State */}
            {isLoadingData ? (
              <Loading />
            ) : !isCreate && !villageDetail ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No village data available
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
                    {/* Village Code */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="villageCode"
                        className="text-sm font-medium"
                      >
                        Village Code <span className="text-red-500">*</span>
                      </Label>
                      <Controller
                        control={control}
                        name="villageCode"
                        render={({ field }) => (
                          <Input
                            {...field}
                            id="villageCode"
                            placeholder="Enter village code"
                            disabled={isSubmitting}
                            className={`transition-colors ${
                              errors.villageCode ? "border-red-500" : ""
                            }`}
                          />
                        )}
                      />
                      {errors.villageCode && (
                        <p className="text-sm text-red-600">
                          {errors.villageCode.message as string}
                        </p>
                      )}
                    </div>

                    {/* Commune Code */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="communeCode"
                        className="text-sm font-medium"
                      >
                        Commune Code <span className="text-red-500">*</span>
                      </Label>
                      <Controller
                        control={control}
                        name="communeCode"
                        render={({ field }) => (
                          <Input
                            {...field}
                            id="communeCode"
                            placeholder="Enter commune code"
                            disabled={isSubmitting}
                            className={`transition-colors ${
                              errors.communeCode ? "border-red-500" : ""
                            }`}
                          />
                        )}
                      />
                      {errors.communeCode && (
                        <p className="text-sm text-red-600">
                          {errors.communeCode.message as string}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Village English */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="villageEn"
                        className="text-sm font-medium"
                      >
                        Village (English){" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Controller
                        control={control}
                        name="villageEn"
                        render={({ field }) => (
                          <Input
                            {...field}
                            id="villageEn"
                            placeholder="Enter village name in English"
                            disabled={isSubmitting}
                            className={`transition-colors ${
                              errors.villageEn ? "border-red-500" : ""
                            }`}
                          />
                        )}
                      />
                      {errors.villageEn && (
                        <p className="text-sm text-red-600">
                          {errors.villageEn.message as string}
                        </p>
                      )}
                    </div>

                    {/* Village Khmer */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="villageKh"
                        className="text-sm font-medium"
                      >
                        Village (Khmer) <span className="text-red-500">*</span>
                      </Label>
                      <Controller
                        control={control}
                        name="villageKh"
                        render={({ field }) => (
                          <Input
                            {...field}
                            id="villageKh"
                            placeholder="Enter village name in Khmer"
                            disabled={isSubmitting}
                            className={`transition-colors ${
                              errors.villageKh ? "border-red-500" : ""
                            }`}
                          />
                        )}
                      />
                      {errors.villageKh && (
                        <p className="text-sm text-red-600">
                          {errors.villageKh.message as string}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t flex-shrink-0 gap-4">
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            {isSubmitting ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                {isCreate ? "Creating village..." : "Updating village..."}
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
                "Create Village"
              ) : (
                "Update Village"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
