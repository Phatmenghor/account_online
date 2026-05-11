"use client";

import type React from "react";
import { FileText, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { ReferenceModel } from "@/models/static/reference/reference.response";
import { useEffect, useState } from "react";
import { getReferenceByIdService } from "@/services/dashboard/reference/reference.service";
import { DateTimeFormat } from "@/utils/date/date-time-format";
import { StatusBadge } from "../badge/status-badge";

interface ReferenceViewModalProps {
  reference?: ReferenceModel;
  referenceId?: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReferenceViewModal({
  reference: initialReference,
  referenceId,
  isOpen,
  onClose,
}: ReferenceViewModalProps) {
  const [reference, setReference] = useState<ReferenceModel | undefined>(
    initialReference
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (initialReference) {
      setReference(initialReference);
      return;
    }

    if (referenceId) {
      const fetchReference = async () => {
        setLoading(true);
        try {
          const data = await getReferenceByIdService(referenceId);
          setReference(data);
        } catch (error) {
          console.error("Failed to fetch reference:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchReference();
    }
  }, [referenceId, initialReference, isOpen]);

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 border-green-200";
      case "DELETE":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

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
                Reference Bank Details
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                {reference?.nameEn
                  ? `Details for "${reference.nameEn}"`
                  : reference?.nameKh
                  ? `Details for "${reference.nameKh}"`
                  : "Bank information"}
              </DialogDescription>

              {reference && (
                <Badge className={getStatusColor(reference?.status ?? "")}>
                  <Shield className="h-3 w-3" />
                  <span className="ml-1">{reference?.status || "ACTIVE"}</span>
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6">
            {loading ? (
              <div className="text-center text-muted-foreground">
                Loading bank...
              </div>
            ) : reference ? (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Name (English):
                      </Label>
                      <span className="text-sm flex items-center gap-2">
                        {reference?.nameEn || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Name (Khmer):
                      </Label>
                      <span className="text-sm flex items-center gap-2">
                        {reference?.nameKh || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Status:
                      </Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {<StatusBadge status={reference?.status} />}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Created At:
                      </Label>
                      <span className="text-sm flex items-center gap-2">
                        {DateTimeFormat(reference?.createdAt) || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Updated At:
                      </Label>
                      <span className="text-sm flex items-center gap-2">
                        {DateTimeFormat(reference?.updatedAt) || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No bank data available</p>
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
