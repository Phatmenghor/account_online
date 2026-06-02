"use client";

import type React from "react";
import { Heart } from "lucide-react";
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
import { MaritalModel } from "@/models/static/marital/marital.response";
import { getMaritalByIdService } from "@/services/dashboard/marital/marital.service";
import { DateTimeFormat } from "@/utils/date/date-time-format";
import { StatusBadge } from "@/components/shared/badge/status-badge";

interface MaritalViewModalProps {
  marital?: MaritalModel;
  maritalId?: number;
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

export default function MaritalViewModal({
  marital: initialMarital,
  maritalId,
  isOpen,
  onClose,
}: MaritalViewModalProps) {
  const [marital, setMarital] = useState<MaritalModel | undefined>(initialMarital);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (initialMarital) {
      setMarital(initialMarital);
      return;
    }
    if (maritalId) {
      setLoading(true);
      getMaritalByIdService(maritalId)
        .then(setMarital)
        .catch((err) => console.error("Failed to fetch:", err))
        .finally(() => setLoading(false));
    }
  }, [maritalId, initialMarital, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0 gap-0 flex flex-col">
        <DialogHeader className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-4 pr-8">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Heart className="w-6 h-6 text-foreground" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold">Marital Status Details</DialogTitle>
              <DialogDescription className="sr-only">Marital Status Details</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : marital ? (
            <div className="space-y-4">
              <SectionHeader color="bg-pink-600" title="Marital Information" />
              <div className="space-y-3">
                <InfoRow label="Name (EN)" value={marital.nameEn} />
                <InfoRow label="Name (KH)" value={marital.nameKh} />
                <InfoRow label="Status" value={<StatusBadge status={marital.status} />} />
                <InfoRow label="Created At" value={DateTimeFormat(marital.createdAt)} />
                <InfoRow label="Updated At" value={DateTimeFormat(marital.updatedAt)} />
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
