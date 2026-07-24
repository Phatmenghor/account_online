"use client";

import type React from "react";
import { MapPin } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { CommuneModel } from "@/features/master-data/types/commune/commune.response";
import { getCommuneByIdService } from "@/features/master-data/services/commune/commune.service";
import { DateTimeFormat } from "@/utils/date/date-time-format";

interface CommuneViewModalProps {
  commune?: CommuneModel;
  communeId?: number;
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

export default function CommuneViewModal({
  commune: initialCommune,
  communeId,
  isOpen,
  onClose,
}: CommuneViewModalProps) {
  const [commune, setCommune] = useState<CommuneModel | undefined>(initialCommune);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (initialCommune) {
      setCommune(initialCommune);
      return;
    }
    if (communeId) {
      setLoading(true);
      getCommuneByIdService(communeId)
        .then(setCommune)
        .catch((err) => console.error("Failed to fetch:", err))
        .finally(() => setLoading(false));
    }
  }, [communeId, initialCommune, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-0 gap-0 flex flex-col">
        <DialogHeader className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-4 pr-8">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <MapPin className="w-6 h-6 text-foreground" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold">Commune Details</DialogTitle>
              <DialogDescription className="sr-only">Commune Details</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : commune ? (
            <div className="space-y-3">
                <InfoRow label="Commune Code" value={commune.communeCode} />
                <InfoRow label="Name (EN)" value={commune.communeEn} />
                <InfoRow label="Name (KH)" value={commune.communeKh} />
                <InfoRow label="District" value={commune.district?.districtEn} />
                <InfoRow label="Province" value={commune.district?.province?.provinceEn} />
                <InfoRow label="Created At" value={DateTimeFormat(commune.createdAt)} />
                <InfoRow label="Updated At" value={DateTimeFormat(commune.updatedAt)} />
              </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No data available</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}


