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
import { useEffect, useState } from "react";
import { getProvinceByIdService } from "@/services/dashboard/province/province.service";
import { ProvinceModel } from "@/models/static/province/province.response";
import { DateTimeFormat } from "@/utils/date/date-time-format";

interface ProvinceViewModalProps {
  province?: ProvinceModel;
  provinceId?: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProvinceViewModal({
  province: initialProvince,
  provinceId,
  isOpen,
  onClose,
}: ProvinceViewModalProps) {
  const [province, setProvince] = useState<ProvinceModel | undefined>(
    initialProvince
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (initialProvince) {
      setProvince(initialProvince);
      return;
    }

    if (provinceId) {
      const fetchReference = async () => {
        setLoading(true);
        try {
          const data = await getProvinceByIdService(provinceId);
          setProvince(data);
        } catch (error) {
          console.error("Failed to fetch reference:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchReference();
    }
  }, [provinceId, initialProvince, isOpen]);

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
                Province Details
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                {province?.provinceEn
                  ? `Details for "${province.provinceEn}"`
                  : province?.provinceKh
                  ? `Details for "${province?.provinceKh}"`
                  : "Province information"}
              </DialogDescription>

              {/* {province && (
                <Badge className={getStatusColor(province?.status ?? "")}>
                  <Shield className="h-3 w-3" />
                  <span className="ml-1">{reference?.status || "ACTIVE"}</span>
                </Badge>
              )} */}
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
            ) : province ? (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Province (English):
                      </Label>
                      <span className="text-sm flex items-center gap-2">
                        {province?.provinceEn || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Province (Khmer):
                      </Label>
                      <span className="text-sm flex items-center gap-2">
                        {province?.provinceKh || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Province Code:
                      </Label>
                      <span className="text-sm flex items-center gap-2">
                        {province?.provinceCode || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Created At:
                      </Label>
                      <span className="text-sm flex items-center gap-2">
                        {DateTimeFormat(province?.createdAt) || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Updated At:
                      </Label>
                      <span className="text-sm flex items-center gap-2">
                        {DateTimeFormat(province?.updatedAt) || "N/A"}
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
