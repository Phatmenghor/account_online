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
  CreateCommuneSchema,
  UpdateCommuneSchema,
  CreateCommuneForm,
  UpdateCommuneForm,
} from "@/features/master-data/types/commune/commune.schema";
import { FileText, FilePenLine, Loader2 } from "lucide-react";
import Loading from "@/components/shared/common/loading";
import { ModalMode } from "@/constants/AppResource/display-list/enum/mode";
import {
  CreateCommuneReq,
  UpdateCommuneReq,
} from "@/features/master-data/types/commune/commune.request";
import { CommuneModel } from "@/features/master-data/types/commune/commune.response";
import { getCommuneByIdService } from "@/features/master-data/services/commune/commune.service";

type ModalCommuneProps = {
  isOpen: boolean;
  onClose: () => void;
  mode: ModalMode;
  communeId?: number;
  isSubmitting?: boolean;
  error?: string | null;
  onSave: (
    data: CreateCommuneReq | { id: number; updates: UpdateCommuneReq }
  ) => void;
  districts?: Array<{
    districtCode: string;
    districtEn: string;
    districtKh: string;
  }>;
};

export default function ModalCommune({
  isOpen,
  onClose,
  mode,
  communeId,
  onSave,
  isSubmitting = false,
  error = null,
  districts = [],
}: ModalCommuneProps) {
  const isCreate = mode === ModalMode.CREATE_MODE;

  const [communeDetail, setCommuneDetail] = useState<CommuneModel | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const form = useForm<CreateCommuneForm | UpdateCommuneForm>({
    resolver: zodResolver(isCreate ? CreateCommuneSchema : UpdateCommuneSchema),
    defaultValues: isCreate
      ? {
          communeCode: "",
          communeEn: "",
          communeKh: "",
          districtCode: "",
        }
      : undefined,
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = form;

  const loadCommuneById = useCallback(async () => {
    if (!communeId || isCreate) return;

    setIsLoadingData(true);
    try {
      const commune = await getCommuneByIdService(communeId);
      setCommuneDetail(commune);
      reset({
        id: commune.id,
        communeCode: commune.communeCode || "",
        communeEn: commune.communeEn || "",
        communeKh: commune.communeKh || "",
        districtCode: commune.district?.districtCode || "",
      });
    } catch (err) {
      console.error("Failed to fetch commune:", err);
    } finally {
      setIsLoadingData(false);
    }
  }, [communeId, isCreate, reset]);

  useEffect(() => {
    if (isOpen && !isCreate) {
      loadCommuneById();
    }
    if (isOpen && isCreate) {
      reset({
        communeCode: "",
        communeEn: "",
        communeKh: "",
        districtCode: "",
      });
      setCommuneDetail(null);
    }
  }, [isOpen, isCreate, loadCommuneById, reset]);

  const onSubmit = (data: CreateCommuneForm | UpdateCommuneForm) => {
    if (isCreate) {
      const payload: CreateCommuneReq = data as CreateCommuneForm;
      onSave(payload);
    } else {
      const updateData = data as UpdateCommuneForm;
      if (!updateData.id) return console.error("Missing ID for update");

      const payload: UpdateCommuneReq = {
        communeCode: updateData.communeCode?.trim(),
        communeEn: updateData.communeEn?.trim(),
        communeKh: updateData.communeKh?.trim(),
        districtCode: updateData.districtCode?.trim(),
      };
      onSave({ id: updateData.id, updates: payload });
    }
  };

  const handleClose = () => {
    reset();
    setCommuneDetail(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg w-full max-h-[90vh] overflow-hidden p-0 flex flex-col gap-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <div className="flex items-center gap-4 pr-8">
            <div
              className="p-2 rounded-full bg-primary/10"
            >
              {isCreate ? (
                <FileText className="h-5 w-5 text-primary" />
              ) : (
                <FilePenLine className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold">
                {isCreate ? "Create New Commune" : "Edit Commune"}
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                {isCreate
                  ? "Fill in the details to create a new commune"
                  : communeDetail
                  ? `Update information for "${
                      communeDetail.communeEn || communeDetail.communeKh
                    }"`
                  : "Loading commune information..."}
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
            ) : !isCreate && !communeDetail ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No commune data available
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

                    {/* District Code */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="districtCode"
                        className="text-sm font-medium"
                      >
                        District Code <span className="text-red-500">*</span>
                      </Label>
                      <Controller
                        control={control}
                        name="districtCode"
                        render={({ field }) => (
                          <Input
                            {...field}
                            id="districtCode"
                            placeholder="Enter district code"
                            disabled={isSubmitting}
                            className={`transition-colors ${
                              errors.districtCode ? "border-red-500" : ""
                            }`}
                          />
                        )}
                      />
                      {errors.districtCode && (
                        <p className="text-sm text-red-600">
                          {errors.districtCode.message as string}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Commune English */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="communeEn"
                        className="text-sm font-medium"
                      >
                        Commune (English){" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Controller
                        control={control}
                        name="communeEn"
                        render={({ field }) => (
                          <Input
                            {...field}
                            id="communeEn"
                            placeholder="Enter commune name in English"
                            disabled={isSubmitting}
                            className={`transition-colors ${
                              errors.communeEn ? "border-red-500" : ""
                            }`}
                          />
                        )}
                      />
                      {errors.communeEn && (
                        <p className="text-sm text-red-600">
                          {errors.communeEn.message as string}
                        </p>
                      )}
                    </div>

                    {/* Commune Khmer */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="communeKh"
                        className="text-sm font-medium"
                      >
                        Commune (Khmer) <span className="text-red-500">*</span>
                      </Label>
                      <Controller
                        control={control}
                        name="communeKh"
                        render={({ field }) => (
                          <Input
                            {...field}
                            id="communeKh"
                            placeholder="Enter commune name in Khmer"
                            disabled={isSubmitting}
                            className={`transition-colors ${
                              errors.communeKh ? "border-red-500" : ""
                            }`}
                          />
                        )}
                      />
                      {errors.communeKh && (
                        <p className="text-sm text-red-600">
                          {errors.communeKh.message as string}
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
                {isCreate ? "Creating commune..." : "Updating commune..."}
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
                "Create Commune"
              ) : (
                "Update Commune"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


