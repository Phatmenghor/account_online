"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MenuItemDto, RoleEnum } from "@/models/menu/menu.types";
import { UserCombobox } from "./user-combobox";
import { UserModel } from "@/models/user/user.response";
import { getRoles } from "@/utils/local-storage/roles";

interface UserMenuConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  allMenus: MenuItemDto[];
  onFetchUserMenus: (userId: number) => Promise<MenuItemDto[]>; // returns full objects
  onSaveUserMenus: (userId: number, menuIds: number[]) => Promise<void>;
}

export function UserMenuConfigModal({
  isOpen,
  onClose,
  allMenus,
  onFetchUserMenus,
  onSaveUserMenus,
}: UserMenuConfigModalProps) {
  const [selectedUser, setSelectedUser] = useState<UserModel | null>(null);
  const [userMenus, setUserMenus] = useState<number[]>([]);
  const [loadingUserMenus, setLoadingUserMenus] = useState(false);
  const [saving, setSaving] = useState(false);

  const currentUserRole = getRoles();

  // Flatten nested menu objects to IDs
  const flattenMenuIds = (menus: MenuItemDto[]): number[] => {
    const ids: number[] = [];
    const helper = (items: MenuItemDto[]) => {
      items.forEach((item) => {
        ids.push(item.id);
        if (item.children && item.children.length > 0) {
          helper(item.children);
        }
      });
    };
    helper(menus);
    return ids;
  };

  const handleFetchUserMenus = async () => {
    if (!selectedUser) return;

    setLoadingUserMenus(true);
    try {
      const menus = await onFetchUserMenus(selectedUser.id);
      const menuIds = flattenMenuIds(menus);
      setUserMenus(menuIds);
    } catch (error) {
      console.error("Failed to fetch user menus:", error);
      setUserMenus([]);
    } finally {
      setLoadingUserMenus(false);
    }
  };

  const handleSaveUserMenus = async () => {
    if (!selectedUser) return;

    setSaving(true);
    try {
      await onSaveUserMenus(selectedUser.id, userMenus);
      onClose();
      setSelectedUser(null);
      setUserMenus([]);
    } catch (error) {
      console.error("Failed to save user menus:", error);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (selectedUser) {
      handleFetchUserMenus();
    }
  }, [selectedUser]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedUser(null);
      setUserMenus([]);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] p-0 flex flex-col gap-0">
        <DialogHeader className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <DialogTitle>User Menu Configuration</DialogTitle>
          <DialogDescription>
            Assign specific menus to a user. This will override their role-based
            menus.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-auto">
          <div className="p-6 space-y-8">
            <div className="flex gap-2 items-end">
              <div className="grid w-full gap-1.5">
                <label className="text-sm font-medium">Select User</label>
                <UserCombobox
                  selectedUser={selectedUser}
                  placeholder="Search and select user..."
                  onSelect={setSelectedUser}
                />
              </div>
              <Button
                onClick={handleFetchUserMenus}
                disabled={loadingUserMenus || !selectedUser}
              >
                {loadingUserMenus ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Fetch Menus"
                )}
              </Button>
            </div>

            <div className="border rounded-md p-4 max-h-[400px]">
              <h4 className="mb-4 text-sm font-medium leading-none">
                Select Menus
              </h4>
              {allMenus.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No menus available.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allMenus.map((menu) => {
                    const isDeveloperEditing =
                      currentUserRole === RoleEnum.DEVELOPER;

                    const hasRoleAccess = selectedUser
                      ? menu.roles.includes(selectedUser.userRole as RoleEnum)
                      : false;

                    const isChecked = isDeveloperEditing
                      ? userMenus.includes(menu.id)
                      : userMenus.includes(menu.id) || hasRoleAccess;

                    return (
                      <div key={menu.id} className="flex items-start space-x-2">
                        <Checkbox
                          id={`menu-${menu.id}`}
                          checked={isChecked}
                          disabled={!isDeveloperEditing}
                          onCheckedChange={(checked) => {
                            if (!isDeveloperEditing) return;

                            if (checked) {
                              setUserMenus((prev) => [...prev, menu.id]);
                            } else {
                              setUserMenus((prev) =>
                                prev.filter((id) => id !== menu.id)
                              );
                            }
                          }}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor={`menu-${menu.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {menu.title}
                            {hasRoleAccess && !isDeveloperEditing && (
                              <span className="ml-2 text-xs text-muted-foreground font-normal">
                                (Role Access)
                              </span>
                            )}
                          </label>
                          <p className="text-xs text-muted-foreground">
                            {menu.href} ({menu.roles.join(", ")})
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center p-6 border-t bg-muted/30 flex-shrink-0 gap-4">
          <Button
            onClick={handleSaveUserMenus}
            disabled={saving || loadingUserMenus || !selectedUser}
          >
            {saving ? "Saving..." : "Save Configuration"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
