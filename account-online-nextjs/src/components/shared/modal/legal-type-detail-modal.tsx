"use client";

import type React from "react";
import { FileText } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { LegalTypeModel } from "@/models/static/legal-type/legal-type.schema";
import { getLegalTypeByIdService } from "@/services/dashboard/legal-type/legal-type.service";
import { DateTimeFormat } from "@/utils/date/date-time-format";
import { StatusBadge } from "@/components/shared/badge/status-badge";

interface LegalTypeViewModalProps {
  legalType?: LegalTypeModel;
  legalTypeId?: number;
  isOpen: boolean;
  onClose: () => void;
}

function InfoRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex justify-between border-b pb-2 gap-4">
      <Label className="text-sm font-medium text-muted-foreground shrink-0">{label}:</Label>
      <span className="text-sm font-semibold text-right">{value || "N/A"}</span>
    </div>
  );
}

function SectionHeader({ color, title }: { color: string; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-1 h-6 ${color} rounded-full`} />
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
  );
}

export default function LegalTypeViewModal({
  legalType: initialLegalType,
  legalTypeId,
  isOpen,
  onClose,
}: LegalTypeViewModalProps) {
  const [legalType, setLegalType] = useState<LegalTypeModel | undefined>(initialLegalType);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (initialLegalType) {
      setLegalType(initialLegalType);
      return;
    }
    if (legalTypeId) {
      setLoading(true);
      getLegalTypeByIdService(legalTypeId)
        .then(setLegalType)
        .catch((err) => console.error("Failed to fetch:", err))
        .finally(() => setLoading(false));
    }
  }, [legalTypeId, initialLegalType, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto p-0 gap-0 flex flex-col">
        <DialogHeader className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-4 pr-8">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <FileText className="w-6 h-6 text-foreground" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold">Legal Type Details</DialogTitle>
              <DialogDescription className="sr-only">Legal Type Details</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : legalType ? (
            <div className="space-y-4">
              <SectionHeader color="bg-blue-600" title="Legal Type Information" />
              <div className="space-y-3">
                <InfoRow label="Name (EN)" value={legalType.nameEn} />
                <InfoRow label="Name (KH)" value={legalType.nameKh} />
                <InfoRow label="Legal Type Value" value={legalType.legalTypeValue} />
                <InfoRow label="Status" value={<StatusBadge status={legalType.status} />} />
                <InfoRow label="Created At" value={DateTimeFormat(legalType.createdAt)} />
                <InfoRow label="Updated At" value={DateTimeFormat(legalType.updatedAt)} />
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No data available</div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-muted/30 flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
