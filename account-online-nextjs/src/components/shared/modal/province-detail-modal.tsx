"use client";

import type React from "react";
import { MapPin } from "lucide-react";
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
import { ProvinceModel } from "@/models/static/province/province.response";
import { getProvinceByIdService } from "@/services/dashboard/province/province.service";
import { DateTimeFormat } from "@/utils/date/date-time-format";

interface ProvinceViewModalProps {
  province?: ProvinceModel;
  provinceId?: number;
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

export default function ProvinceViewModal({
  province: initialProvince,
  provinceId,
  isOpen,
  onClose,
}: ProvinceViewModalProps) {
  const [province, setProvince] = useState<ProvinceModel | undefined>(initialProvince);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (initialProvince) {
      setProvince(initialProvince);
      return;
    }
    if (provinceId) {
      setLoading(true);
      getProvinceByIdService(provinceId)
        .then(setProvince)
        .catch((err) => console.error("Failed to fetch:", err))
        .finally(() => setLoading(false));
    }
  }, [provinceId, initialProvince, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 gap-0 flex flex-col">
        <DialogHeader className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-4 pr-8">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <MapPin className="w-6 h-6 text-foreground" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold">Province Details</DialogTitle>
              <DialogDescription className="sr-only">Province Details</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : province ? (
            <div className="space-y-4">
              <SectionHeader color="bg-teal-600" title="Province Information" />
              <div className="space-y-3">
                <InfoRow label="Province Code" value={province.provinceCode} />
                <InfoRow label="Name (EN)" value={province.provinceEn} />
                <InfoRow label="Name (KH)" value={province.provinceKh} />
                <InfoRow label="Created At" value={DateTimeFormat(province.createdAt)} />
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
