"use client";

import type React from "react";
import { FileText } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CommuneModel } from "@/models/static/commune/commune.response";
import { useEffect, useState } from "react";
import { getCommuneByIdService } from "@/services/dashboard/commune/commune.service";
import { DateTimeFormat } from "@/utils/date/date-time-format";

interface CommuneViewModalProps {
  commune?: CommuneModel;
  communeId?: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function CommuneViewModal({
  commune: initialCommune,
  communeId,
  isOpen,
  onClose,
}: CommuneViewModalProps) {
  const [commune, setCommune] = useState<CommuneModel | undefined>(
    initialCommune
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (initialCommune) {
      setCommune(initialCommune);
      return;
    }

    if (communeId) {
      const fetchCommune = async () => {
        setLoading(true);
        try {
          const data = await getCommuneByIdService(communeId);
          setCommune(data);
        } catch (error) {
          console.error("Failed to fetch commune:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchCommune();
    }
  }, [communeId, initialCommune, isOpen]);

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0 gap-0 flex flex-col">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-4 pr-8">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <FileText className="w-6 h-6 text-foreground" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold">
                Commune Details
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                {commune?.communeEn
                  ? `Details for "${commune.communeEn}"`
                  : commune?.communeKh
                  ? `Details for "${commune.communeKh}"`
                  : "Commune information"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6">
            {loading ? (
              <div className="text-center text-muted-foreground">
                Loading commune...
              </div>
            ) : commune ? (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Commune Code:
                      </Label>
                      <span className="text-sm flex items-center gap-2">
                        {commune?.communeCode || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Commune (English):
                      </Label>
                      <span className="text-sm flex items-center gap-2">
                        {commune?.communeEn || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Commune (Khmer):
                      </Label>
                      <span className="text-sm flex items-center gap-2">
                        {commune?.communeKh || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">
                        District Code:
                      </Label>
                      <span className="text-sm flex items-center gap-2">
                        {commune?.district?.districtCode || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">
                        District (English):
                      </Label>
                      <span className="text-sm flex items-center gap-2">
                        {commune?.district?.districtEn || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">
                        District (Khmer):
                      </Label>
                      <span className="text-sm flex items-center gap-2">
                        {commune?.district?.districtKh || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Province Code:
                      </Label>
                      <span className="text-sm flex items-center gap-2">
                        {commune?.district?.province?.provinceCode || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Province (English):
                      </Label>
                      <span className="text-sm flex items-center gap-2">
                        {commune?.district?.province?.provinceEn || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Province (Khmer):
                      </Label>
                      <span className="text-sm flex items-center gap-2">
                        {commune?.district?.province?.provinceKh || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Created At:
                      </Label>
                      <span className="text-sm flex items-center gap-2">
                        {DateTimeFormat(commune?.createdAt) || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Updated At:
                      </Label>
                      <span className="text-sm flex items-center gap-2">
                        {DateTimeFormat(commune?.updatedAt) || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No commune data available
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t bg-muted/30 flex-shrink-0">
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
