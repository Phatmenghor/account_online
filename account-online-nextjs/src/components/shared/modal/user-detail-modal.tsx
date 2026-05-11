import type React from "react";
import { Shield, Briefcase, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { UserModel } from "@/models/user/user.response";
import { getRoleDisplayName } from "@/utils/role-display";

interface UserViewModalProps {
  user?: UserModel;
  isOpen: boolean;
  onClose: () => void;
}

export function UserViewModal({ user, isOpen, onClose }: UserViewModalProps) {
  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case "developer":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "admin":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "user":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return <Crown className="h-4 w-4" />;
      case "developer":
        return <Briefcase className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const handleClose = () => {
    onClose();
  };

  const profileImageUrl =
    user?.profileUrl && process.env.NEXT_PUBLIC_API_BASE_URL
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${user.profileUrl}`
      : undefined;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl h-[90vh] p-0 gap-0 flex flex-col">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-4 pr-8">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={user?.profileUrl ? profileImageUrl : ""}
                alt={user?.fullName}
              />
              <AvatarFallback className="text-lg bg-primary/10 text-primary">
                {user?.fullName?.[0] || user?.email?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold">
                User Profile
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                {user?.fullName
                  ? `Profile information for "${user.fullName}"`
                  : user?.email
                    ? `Profile information for "${user.email}"`
                    : "User profile information"}
              </DialogDescription>

              <Badge className={getRoleColor(user?.userRole ?? "")}>
                {getRoleIcon(user?.userRole ?? "")}
                <span className="ml-1">{getRoleDisplayName(user?.userRole || "USER")}</span>
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6">
            {user ? (
              <div className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold">
                      Personal Information
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Email:
                      </Label>
                      <span className="text-sm flex items-center gap-2">
                        {user?.email || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Full Name:
                      </Label>
                      <span className="text-sm flex items-center gap-2">
                        {user?.fullName || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Position:
                      </Label>
                      <span className="text-sm flex items-center gap-2">
                        {user?.position || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">
                        ID Card:
                      </Label>
                      <span className="text-sm flex items-center gap-2">
                        {user?.idCard || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-green-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold">
                      Account Information
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">
                        User Role:
                      </Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {getRoleDisplayName(user?.userRole || "USER")}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Access Level:
                      </Label>
                      <span className="text-sm flex items-center gap-2">
                        {user.userRole === "BUSINESS" ? (
                          <>Full Access</>
                        ) : (
                          <>Limited Access</>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* System Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold">
                      System Information
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Created At:
                      </Label>
                      <span className="text-sm flex items-center gap-2">
                        {formatDate(user?.createdAt ?? "")}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Last Login:
                      </Label>
                      <span className="text-sm flex items-center gap-2">
                        {formatDate(user?.lastLogin ?? "")}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Last Updated:
                      </Label>
                      <span className="text-sm flex items-center gap-2">
                        {formatDate(user?.updatedAt ?? "")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No user data available</p>
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
