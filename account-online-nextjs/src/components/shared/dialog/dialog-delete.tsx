"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Trash2 } from "lucide-react";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => Promise<void>;
  title: string;
  description: string;
  itemName?: string;
  isSubmitting: boolean;
}

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onDelete,
  title,
  description,
  itemName,
  isSubmitting,
}: DeleteConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden rounded-2xl border border-slate-200 shadow-2xl bg-white flex flex-col">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-slate-200 bg-white flex flex-row items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center shrink-0 text-red-600">
            <Trash2 className="w-5 h-5" />
          </div>
          <div className="flex flex-col gap-0.5 min-w-0 pr-6">
            <DialogTitle className="text-base font-bold text-slate-900 tracking-tight leading-tight">
              {title}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Confirm deletion action
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Content Body */}
        <div className="p-6 space-y-3">
          <p className="text-sm text-slate-600 leading-relaxed">
            {description}
            {itemName && (
              <span className="font-semibold text-slate-900"> "{itemName}"</span>
            )}
            ? This action cannot be undone.
          </p>
        </div>

        {/* Footer Buttons — Symmetrical with Header (px-6 py-4) */}
        <div className="px-6 py-4 bg-slate-100/90 border-t border-slate-200 flex flex-row items-center justify-end gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-10 px-5 rounded-xl border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold shadow-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onDelete}
            disabled={isSubmitting}
            className="h-10 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete</span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
