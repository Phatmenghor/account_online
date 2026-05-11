"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/shared/table/data-table";
import { createRequestHistoryTableColumns } from "@/components/shared/table/request-history-content";
import { Skeleton } from "@/components/ui/skeleton";
import { ReviewHistoryResponseDto } from "@/models/open-account-admin/pending-account.response";

interface RequestAuditTrailModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditTrail: ReviewHistoryResponseDto | null;
  isLoading?: boolean;
}

export default function RequestAuditTrailModal({
  isOpen,
  onClose,
  auditTrail,
  isLoading = false,
}: RequestAuditTrailModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Audit Trail</DialogTitle>
          <DialogDescription>
            {auditTrail?.legalId && `Legal ID: ${auditTrail.legalId}`}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : auditTrail && auditTrail.history.length > 0 ? (
          <div className="border rounded-md overflow-hidden">
            <DataTable
              data={auditTrail.history}
              columns={createRequestHistoryTableColumns()}
              emptyMessage="No audit trail records found"
              getRowKey={(record) => record.id ?? crypto.randomUUID()}
            />
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No audit trail records found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
