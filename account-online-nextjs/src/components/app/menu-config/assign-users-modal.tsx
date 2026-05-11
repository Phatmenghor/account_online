"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { MenuItemDto } from "@/models/menu/menu.types";
import { UserModel } from "@/models/user/user.response";
import { UserCombobox } from "./user-combobox";

interface AssignUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  menu: MenuItemDto | null;
  onAssignUser: (userId: number) => Promise<void>;
  onRemoveUser: (userId: number) => Promise<void>;
}

export function AssignUsersModal({
  isOpen,
  onClose,
  menu,
  onAssignUser,
  onRemoveUser,
}: AssignUsersModalProps) {
  const [selectedUser, setSelectedUser] = useState<UserModel | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssignUser = async () => {
    if (!selectedUser) return;

    setIsAssigning(true);
    try {
      await onAssignUser(selectedUser.id);
      setSelectedUser(null);
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full max-h-[90vh] p-0 flex flex-col gap-0">
        <DialogHeader className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <DialogTitle>Assign Users to Menu</DialogTitle>
          <DialogDescription>
            Manage users who have access to <strong>{menu?.title}</strong>.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-auto">
          <div className="p-6 space-y-8">
            <label className="text-sm font-medium">Select User</label>
            <div className="flex gap-2">
              <UserCombobox
                selectedUser={selectedUser}
                onSelect={setSelectedUser}
                placeholder="Search and select user..."
              />
              <Button
                onClick={handleAssignUser}
                disabled={!selectedUser || isAssigning}
              >
                {isAssigning ? "Adding..." : "Add"}
              </Button>
            </div>
          </div>

          <div className="flex justify-between items-center p-6 border-t bg-muted/30 flex-shrink-0 gap-4">
            <label className="text-sm font-medium">Allowed Users</label>
            <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[50px]">
              {menu?.allowedUserIds && menu.allowedUserIds.length > 0 ? (
                menu.allowedUserIds.map((userId) => (
                  <Badge
                    key={userId}
                    variant="outline"
                    className="gap-1 pl-2 pr-1 py-1"
                  >
                    User #{userId}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 rounded-full hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => onRemoveUser(userId)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">
                  No specific users assigned.
                </span>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
