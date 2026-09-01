"use client";

import { CustomButton } from "@/components/shared/button/custom-button";
import { CustomModal } from "./custom-modal";
import { useEffect, useState } from "react";


import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Trash2, Loader2, type LucideIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => Promise<void>;
  title: string;
  description: string;
  icon?: LucideIcon;
  itemName?: string;
  isSubmitting?: boolean;
  variant?: "default" | "critical";
  requireConfirmation?: boolean;
  confirmationText?: string;
  confirmButtonText?: string;
  errorMessage?: string;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onDelete,
  title,
  description,
  icon,
  itemName,
  isSubmitting = false,
  variant = "default",
  requireConfirmation = false,
  confirmationText = "DELETE",
  confirmButtonText,
  errorMessage,
}: DeleteConfirmationDialogProps) {
  const [confirmationValue, setConfirmationValue] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setConfirmationValue("");
      setError(null);
    }
  }, [isOpen]);

  const handleDelete = async () => {
    try {
      setError(null);
      setIsDeleting(true);
      await onDelete();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Operation failed");
    } finally {
      setIsDeleting(false);
    }
  };

  const inFlight = isDeleting || isSubmitting;
  const isCritical = variant === "critical";
  const isDeleteDisabled =
    inFlight ||
    (requireConfirmation && confirmationValue !== confirmationText);

  const buttonLabel = confirmButtonText
    ? confirmButtonText
    : isCritical
      ? "Delete Permanently"
      : "Delete";

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} size="md">
      <FormHeader
        title={title}
        description="Confirm deletion"
        icon={icon ?? Trash2}
        variant="destructive"
      />

      <div className="flex flex-col flex-1 overflow-visible">
        <FormBody contentClassName="px-6 py-4 space-y-4">
          {description && (
            <p className="text-sm text-slate-600 leading-relaxed">
              {description}
            </p>
          )}

          {itemName && (
            <div className="px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">
                Item
              </p>
              <p className="text-sm font-semibold text-slate-900 mt-0.5 truncate">
                {itemName}
              </p>
            </div>
          )}

          {isCritical && (
            <Alert className="border-red-200 bg-red-50/70 py-2.5 rounded-xl">
              <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
              <AlertDescription className="text-xs text-red-600 font-medium leading-relaxed">
                This action cannot be undone.
              </AlertDescription>
            </Alert>
          )}

          {requireConfirmation && (
            <div className="space-y-1.5 pt-1">
              <Label htmlFor="confirmation" className="text-xs font-semibold text-slate-700">
                Type{" "}
                <code className="bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-mono text-xs border border-red-200">
                  {confirmationText}
                </code>{" "}
                to confirm:
              </Label>
              <Input
                id="confirmation"
                value={confirmationValue}
                onChange={(e) => setConfirmationValue(e.target.value)}
                placeholder="Type to confirm"
                className="font-mono h-10 rounded-xl border-slate-200"
                autoComplete="off"
                disabled={inFlight}
              />
            </div>
          )}

          {(error || errorMessage) && (
            <Alert variant="destructive" className="py-2.5 rounded-xl">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <AlertDescription className="text-xs">
                {error || errorMessage}
              </AlertDescription>
            </Alert>
          )}
        </FormBody>

        <FormFooter
          isSubmitting={inFlight}
          isDirty={!requireConfirmation || confirmationValue === confirmationText}
          isCreate={false}
          createMessage="Deleting..."
          updateMessage="Deleting..."
          noChangesMessage={
            requireConfirmation
              ? `Type ${confirmationText} to enable delete`
              : "Confirm to delete"
          }
        >
          <CustomButton
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={inFlight}
            className="h-9 px-4 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </CustomButton>
          <CustomButton
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleteDisabled}
            className="h-9 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold shadow-xs"
          >
            {inFlight ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Deleting...
              </>
            ) : (
              buttonLabel
            )}
          </CustomButton>
        </FormFooter>
      </div>
    </CustomModal>
  );
}
