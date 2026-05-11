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
  CreateDistrictSchema,
  UpdateDistrictSchema,
  CreateDistrictForm,
  UpdateDistrictForm,
} from "@/models/static/district/district.schema";
import { FileText, FilePenLine, Loader2 } from "lucide-react";
import Loading from "@/components/shared/common/loading";
import { ModalMode } from "@/constants/AppResource/display-list/enum/mode";
import {
  CreateDistrictReq,
  UpdateDistrictReq,
} from "@/models/static/district/district.request";
import { DistrictModel } from "@/models/static/district/district.response";
import { getDistrictByIdService } from "@/services/dashboard/district/district.service";

type ModalDistrictProps = {
  isOpen: boolean;
  onClose: () => void;
  mode: ModalMode;
  districtId?: number;
  isSubmitting?: boolean;
  error?: string | null;
  onSave: (
    data: CreateDistrictReq | { id: number; updates: UpdateDistrictReq }
  ) => void;
  provinces?: Array<{
    provinceCode: string;
    provinceEn: string;
    provinceKh: string;
  }>;
};

export default function ModalDistrict({
  isOpen,
  onClose,
  mode,
  districtId,
  onSave,
  isSubmitting = false,
  error = null,
  provinces = [],
}: ModalDistrictProps) {
  const isCreate = mode === ModalMode.CREATE_MODE;

  const [districtDetail, setDistrictDetail] = useState<DistrictModel | null>(
    null
  );
  const [isLoadingData, setIsLoadingData] = useState(false);

  const form = useForm<CreateDistrictForm | UpdateDistrictForm>({
    resolver: zodResolver(
      isCreate ? CreateDistrictSchema : UpdateDistrictSchema
    ),
    defaultValues: isCreate
      ? {
          districtCode: "",
          districtEn: "",
          districtKh: "",
          provinceCode: "",
        }
      : undefined,
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = form;

  const loadDistrictById = useCallback(async () => {
    if (!districtId || isCreate) return;

    setIsLoadingData(true);
    try {
      const district = await getDistrictByIdService(districtId);
      setDistrictDetail(district);
      reset({
        id: district.id,
        districtCode: district.districtCode || "",
        districtEn: district.districtEn || "",
        districtKh: district.districtKh || "",
        provinceCode: district.province?.provinceCode || "",
      });
    } catch (err) {
      console.error("Failed to fetch district:", err);
    } finally {
      setIsLoadingData(false);
    }
  }, [districtId, isCreate, reset]);

  useEffect(() => {
    if (isOpen && !isCreate) {
      loadDistrictById();
    }
    if (isOpen && isCreate) {
      reset({
        districtCode: "",
        districtEn: "",
        districtKh: "",
        provinceCode: "",
      });
      setDistrictDetail(null);
    }
  }, [isOpen, isCreate, loadDistrictById, reset]);

  const onSubmit = (data: CreateDistrictForm | UpdateDistrictForm) => {
    if (isCreate) {
      const payload: CreateDistrictReq = data as CreateDistrictForm;
      onSave(payload);
    } else {
      const updateData = data as UpdateDistrictForm;
      if (!updateData.id) return console.error("Missing ID for update");

      const payload: UpdateDistrictReq = {
        districtCode: updateData.districtCode?.trim(),
        districtEn: updateData.districtEn?.trim(),
        districtKh: updateData.districtKh?.trim(),
        provinceCode: updateData.provinceCode?.trim(),
      };
      onSave({ id: updateData.id, updates: payload });
    }
  };

  const handleClose = () => {
    reset();
    setDistrictDetail(null);
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
                {isCreate ? "Create New District" : "Edit District"}
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                {isCreate
                  ? "Fill in the details to create a new district"
                  : districtDetail
                  ? `Update information for "${
                      districtDetail.districtEn || districtDetail.districtKh
                    }"`
                  : "Loading district information..."}
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
            ) : !isCreate && !districtDetail ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No district data available
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

                    {/* Province */}
                    {/* <div className="space-y-2">
                      <Label htmlFor="provinceCode" className="text-sm font-medium">
                        Province <span className="text-red-500">*</span>
                      </Label>
                      <Controller
                        control={control}
                        name="provinceCode"
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={isSubmitting}
                          >
                            <SelectTrigger
                              id="provinceCode"
                              className="transition-colors"
                            >
                              <SelectValue placeholder="Select province" />
                            </SelectTrigger>
                            <SelectContent>
                              {provinces.map((province) => (
                                <SelectItem
                                  key={province.provinceCode}
                                  value={province.provinceCode}
                                >
                                  {province.provinceEn}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.provinceCode && (
                        <p className="text-sm text-red-600">
                          {errors.provinceCode.message as string}
                        </p>
                      )}
                    </div> */}
                    {/* Province */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="provinceCode"
                        className="text-sm font-medium"
                      >
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* District English */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="districtEn"
                        className="text-sm font-medium"
                      >
                        District (English){" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Controller
                        control={control}
                        name="districtEn"
                        render={({ field }) => (
                          <Input
                            {...field}
                            id="districtEn"
                            placeholder="Enter district name in English"
                            disabled={isSubmitting}
                            className={`transition-colors ${
                              errors.districtEn ? "border-red-500" : ""
                            }`}
                          />
                        )}
                      />
                      {errors.districtEn && (
                        <p className="text-sm text-red-600">
                          {errors.districtEn.message as string}
                        </p>
                      )}
                    </div>

                    {/* District Khmer */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="districtKh"
                        className="text-sm font-medium"
                      >
                        District (Khmer) <span className="text-red-500">*</span>
                      </Label>
                      <Controller
                        control={control}
                        name="districtKh"
                        render={({ field }) => (
                          <Input
                            {...field}
                            id="districtKh"
                            placeholder="Enter district name in Khmer"
                            disabled={isSubmitting}
                            className={`transition-colors ${
                              errors.districtKh ? "border-red-500" : ""
                            }`}
                          />
                        )}
                      />
                      {errors.districtKh && (
                        <p className="text-sm text-red-600">
                          {errors.districtKh.message as string}
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
                {isCreate ? "Creating district..." : "Updating district..."}
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
                "Create District"
              ) : (
                "Update District"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
