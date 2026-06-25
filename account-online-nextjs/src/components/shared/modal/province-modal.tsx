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
import { FileText, FilePenLine, Loader2 } from "lucide-react";
import Loading from "@/components/shared/common/loading";
import { ModalMode } from "@/constants/AppResource/display-list/enum/mode";
import {
  CreateProvinceReq,
  UpdateProvinceReq,
} from "@/models/static/province/province.request";
import {
  CreateProvinceForm,
  CreateProvinceSchema,
  UpdateProvinceForm,
  UpdateProvinceSchema,
} from "@/models/static/province/province.schema";
import { getProvinceByIdService } from "@/services/dashboard/province/province.service";
import { ProvinceModel } from "@/models/static/province/province.response";

type ModalProvinceProps = {
  isOpen: boolean;
  onClose: () => void;
  mode: ModalMode;
  provinceId?: number;
  isSubmitting?: boolean;
  error?: string | null;
  onSave: (
    data: CreateProvinceReq | { id: number; updates: UpdateProvinceReq }
  ) => void;
};

export default function ModalProvince({
  isOpen,
  onClose,
  mode,
  provinceId,
  onSave,
  isSubmitting = false,
  error = null,
}: ModalProvinceProps) {
  const isCreate = mode === ModalMode.CREATE_MODE;

  const [province, setProvince] = useState<ProvinceModel | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const form = useForm<CreateProvinceForm | UpdateProvinceForm>({
    resolver: zodResolver(
      isCreate ? CreateProvinceSchema : UpdateProvinceSchema
    ),
    defaultValues: isCreate
      ? {
          provinceCode: "",
          provinceEn: "",
          provinceKh: "",
        }
      : undefined,
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = form;

  const loadProvinceById = useCallback(async () => {
    if (!provinceId || isCreate) return;

    setIsLoadingData(true);
    try {
      const province = await getProvinceByIdService(provinceId);
      setProvince(province);
      reset({
        id: province.id,
        provinceCode: province.provinceCode,
        provinceEn: province.provinceEn || "",
        provinceKh: province.provinceKh,
      });
    } catch (err) {
      console.error("Failed to fetch province:", err);
    } finally {
      setIsLoadingData(false);
    }
  }, [provinceId, isCreate, reset]);

  useEffect(() => {
    if (isOpen && !isCreate) {
      loadProvinceById();
    }
    if (isOpen && isCreate) {
      reset({
        provinceEn: "",
        provinceKh: "",
      });
      setProvince(null);
    }
  }, [isOpen, isCreate, loadProvinceById, reset]);

  const onSubmit = (data: CreateProvinceForm | UpdateProvinceForm) => {
    if (isCreate) {
      const payload: CreateProvinceReq = data as CreateProvinceForm;
      onSave(payload);
    } else {
      const updateData = data as UpdateProvinceForm;
      if (!updateData.id) {
        console.error("Province code is missing!");
        return;
      }
      const payload: UpdateProvinceReq = {
        provinceCode: updateData.provinceCode?.trim(),
        provinceEn: updateData.provinceEn?.trim(),
        provinceKh: updateData.provinceKh?.trim(),
      };
      console.log("this payload", payload);
      onSave({ id: updateData.id, updates: payload });
    }
  };

  const handleClose = () => {
    reset();
    setProvince(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[750px] w-full max-h-[90vh] overflow-hidden p-0 flex flex-col gap-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
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
                {isCreate ? "Create New Province" : "Edit Province"}
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                {isCreate
                  ? "Fill in the details to create a new province"
                  : province
                  ? `Update information for "${
                      province.provinceEn || province.provinceKh
                    }"`
                  : "Loading province information..."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-auto">
          <div className="p-6 space-y-8">
            {/* Loading State */}
            {isLoadingData ? (
              <Loading />
            ) : !isCreate && !province ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No province data available
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
                    name="provinceCode"
                    render={({ field }) => <input type="hidden" {...field} />}
                  />
                )}

                {/* Basic Information Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Basic Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name English */}
                    <div className="space-y-2">
                      <Label htmlFor="nameEn" className="text-sm font-medium">
                        Province (English){" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Controller
                        control={control}
                        name="provinceEn"
                        render={({ field }) => (
                          <Input
                            {...field}
                            id="provinceEn"
                            placeholder="Enter name in english"
                            disabled={isSubmitting}
                            className={`transition-colors ${
                              errors.provinceEn ? "border-red-500" : ""
                            }`}
                          />
                        )}
                      />
                      {errors.provinceEn && (
                        <p className="text-sm text-red-600">
                          {errors.provinceEn.message as string}
                        </p>
                      )}
                    </div>

                    {/* Name Khmer */}
                    <div className="space-y-2">
                      <Label htmlFor="nameKh" className="text-sm font-medium">
                        Province (Khmer) <span className="text-red-500">*</span>
                      </Label>
                      <Controller
                        control={control}
                        name="provinceKh"
                        render={({ field }) => (
                          <Input
                            {...field}
                            id="provinceKh"
                            placeholder="Enter name in khmer"
                            disabled={isSubmitting}
                            className={`transition-colors ${
                              errors.provinceKh ? "border-red-500" : ""
                            }`}
                          />
                        )}
                      />
                      {errors.provinceKh && (
                        <p className="text-sm text-red-600">
                          {errors.provinceKh.message as string}
                        </p>
                      )}
                    </div>
                    {/* Province code */}
                    <div className="space-y-2">
                      <Label htmlFor="nameEn" className="text-sm font-medium">
                        Province Code <span className="text-red-500">*</span>
                      </Label>
                      <Controller
                        control={control}
                        name="provinceCode"
                        render={({ field }) => (
                          <Input
                            {...field}
                            id="provinceCode"
                            placeholder="Enter province code"
                            disabled={isSubmitting}
                            className={`transition-colors ${
                              errors.provinceCode ? "border-red-500" : ""
                            }`}
                          />
                        )}
                      />
                      {errors.provinceCode && (
                        <p className="text-sm text-red-600">
                          {errors.provinceCode.message as string}
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
        <div className="flex justify-between items-center p-6 border-t bg-muted/30 flex-shrink-0 gap-4">
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            {isSubmitting ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                {isCreate ? "Creating province..." : "Updating province..."}
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
                "Create Province"
              ) : (
                "Update Province"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
