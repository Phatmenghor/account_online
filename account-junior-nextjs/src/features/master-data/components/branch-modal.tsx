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
  CreateBranchReq,
  UpdateBranchReq,
} from "@/features/master-data/types/branch/branch.request";
import { BranchModel } from "@/features/master-data/types/branch/branch.response";
import {
  CreateBranchForm,
  CreateBranchSchema,
  UpdateBranchForm,
  UpdateBranchSchema,
} from "@/features/master-data/types/branch/branch.schema";
import { getBranchByIdService } from "@/features/master-data/services/branch/branch.service";

type ModalBranchProps = {
  isOpen: boolean;
  onClose: () => void;
  mode: ModalMode;
  branchId?: number;
  isSubmitting?: boolean;
  error?: string | null;
  onSave: (
    data: CreateBranchReq | { id: number; updates: UpdateBranchReq }
  ) => void;
};

export default function ModalBranch({
  isOpen,
  onClose,
  mode,
  branchId,
  onSave,
  isSubmitting = false,
  error = null,
}: ModalBranchProps) {
  const isCreate = mode === ModalMode.CREATE_MODE;

  const [branch, setBranch] = useState<BranchModel | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const form = useForm<CreateBranchForm | UpdateBranchForm>({
    resolver: zodResolver(isCreate ? CreateBranchSchema : UpdateBranchSchema),
    defaultValues: isCreate
      ? {
          branchCode: "",
          branchKh: "",
        }
      : undefined,
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = form;

  const loadBranchById = useCallback(async () => {
    if (!branchId || isCreate) return;

    setIsLoadingData(true);
    try {
      const branch = await getBranchByIdService(branchId);
      setBranch(branch);
      reset({
        id: branch.id,
        branchCode: branch.branchCode,
        branchKh: branch.branchKh || "",
      });
    } catch (err) {
      console.error("Failed to fetch branch:", err);
    } finally {
      setIsLoadingData(false);
    }
  }, [branchId, isCreate, reset]);

  useEffect(() => {
    if (isOpen && !isCreate) {
      loadBranchById();
    }
    if (isOpen && isCreate) {
      reset({
        branchCode: "",
        branchKh: "",
      });
      setBranch(null);
    }
  }, [isOpen, isCreate, loadBranchById, reset]);

  const onSubmit = (data: CreateBranchForm | UpdateBranchForm) => {
    if (isCreate) {
      const payload: CreateBranchReq = data as CreateBranchForm;
      onSave(payload);
    } else {
      const updateData = data as UpdateBranchForm;
      if (!updateData.id) {
        console.error("Province code is missing!");
        return;
      }
      const payload: UpdateBranchReq = {
        branchCode: updateData.branchCode?.trim(),
        branchKh: updateData.branchKh?.trim(),
      };
      console.log("this payload", payload);
      onSave({ id: updateData.id, updates: payload });
    }
  };

  const handleClose = () => {
    reset();
    setBranch(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg w-full max-h-[90vh] overflow-hidden p-0 flex flex-col gap-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
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
                {isCreate ? "Create New Branch" : "Edit Branch"}
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                {isCreate
                  ? "Fill in the details to create a new branch"
                  : branch
                  ? `Update information for "${
                      branch.branchCode || branch.branchKh
                    }"`
                  : "Loading branch information..."}
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
            ) : !isCreate && !branch ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No branch data available
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
                    name="branchCode"
                    render={({ field }) => <input type="hidden" {...field} />}
                  />
                )}

                <div className="space-y-4">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name English */}
                    <div className="space-y-2">
                      <Label htmlFor="nameEn" className="text-sm font-medium">
                        Branch Code <span className="text-red-500">*</span>
                      </Label>
                      <Controller
                        control={control}
                        name="branchCode"
                        render={({ field }) => (
                          <Input
                            {...field}
                            id="branchCode"
                            placeholder="Enter branch code"
                            disabled={isSubmitting}
                            className={`transition-colors ${
                              errors.branchCode ? "border-red-500" : ""
                            }`}
                          />
                        )}
                      />
                      {errors.branchCode && (
                        <p className="text-sm text-red-600">
                          {errors.branchCode.message as string}
                        </p>
                      )}
                    </div>

                    {/* branch Khmer */}
                    <div className="space-y-2">
                      <Label htmlFor="nameKh" className="text-sm font-medium">
                        Branch (Khmer) <span className="text-red-500">*</span>
                      </Label>
                      <Controller
                        control={control}
                        name="branchKh"
                        render={({ field }) => (
                          <Input
                            {...field}
                            id="branchKh"
                            placeholder="Enter branch in khmer"
                            disabled={isSubmitting}
                            className={`transition-colors ${
                              errors.branchKh ? "border-red-500" : ""
                            }`}
                          />
                        )}
                      />
                      {errors.branchKh && (
                        <p className="text-sm text-red-600">
                          {errors.branchKh.message as string}
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
                {isCreate ? "Creating branch..." : "Updating branch..."}
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
                "Create Branch"
              ) : (
                "Update Branch"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


