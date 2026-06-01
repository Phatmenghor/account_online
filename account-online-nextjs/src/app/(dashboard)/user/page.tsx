"use client";

import { Suspense } from "react";
import ConfirmDialog from "@/components/shared/dialog/dialog-confirm";
import { DeleteConfirmationDialog } from "@/components/shared/dialog/dialog-delete";
import ResetPasswordModal from "@/components/shared/dialog/dialog-reset-password";
import { CustomPagination } from "@/components/shared/pagination/custom-pagination";
import { DataTable } from "@/components/shared/table/data-table";
import { createUserTableColumns } from "@/components/shared/table/table-content";
import { AppToast } from "@/components/shared/toast/app-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/constants/AppRoutes/routes";
import { usePagination } from "@/hooks/use-pagination";
import { AllUserModel, UserModel } from "@/models/user/user.response";
import {
  createUserService,
  deleteUserService,
  getUsersService,
  updateUserService,
} from "@/services/dashboard/user/user.service";
import { useDebounce } from "@/utils/debounce/debounce";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { startTransition, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import ModalUser from "@/components/shared/modal/user-modal";
import { CreateUserReq, UpdateUserReq } from "@/models/user/user.request";
import Loading from "@/components/shared/common/loading";
import { UserViewModal } from "@/components/shared/modal/user-detail-modal";
import { ModalMode } from "@/constants/AppResource/display-list/enum/mode";
import { getUserInfo } from "@/utils/local-storage/userInfo";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_FILTER_WITH_ALL } from "@/constants/AppResource/filter/role";

function UserPageContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<AllUserModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ACTIVE");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [selectedUser, setSelectedUser] = useState<UserModel | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [mode, setMode] = useState<ModalMode>(ModalMode.CREATE_MODE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] =
    useState(false);
  const [selectedUserToggle, setSelectedUserToggle] =
    useState<UserModel | null>(null);
  const [isToggleStatusDialogOpen, setIsToggleStatusDialogOpen] =
    useState(false);
  const [currentUser, setCurrentUser] = useState<UserModel | null>(null);

  const t = useTranslations();

  const searchParams = useSearchParams();

  // Debounced search query - Optimized api performance when search
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const { currentPage, updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.DASHBOARD.USER,
  });

  // Get current user info for take permission delete user
  useEffect(() => {
    const userInfo = getUserInfo();
    if (userInfo) {
      setCurrentUser(userInfo);
    }
  }, []);

  useEffect(() => {
    const pageParam = searchParams.get("pageNo");
    if (!pageParam) {
      updateUrlWithPage(1, true);
    }
  }, [searchParams, updateUrlWithPage]);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getUsersService({
        search: debouncedSearchQuery,
        pageNo: currentPage,
        pageSize: 15,
        status: statusFilter,
        role: roleFilter === "ALL" ? undefined : roleFilter,
      });
      setUsers(response);
    } catch (error: any) {
      console.log("Failed to fetch users: ", error);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchQuery, statusFilter, roleFilter, currentPage]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers, debouncedSearchQuery, statusFilter, roleFilter]);

  // Simplified search change handler - just updates the state, debouncing handles the rest
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusToggle = async (user: UserModel | null) => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const newStatus =
        user.userStatus.toUpperCase() === "ACTIVE" ? "DELETE" : "ACTIVE";

      // Optimistic update
      setUsers((prev) => {
        if (!prev) return null;
        const updatedContent = prev.content.map((item) =>
          item.id === user.id ? { ...item, status: newStatus } : item
        );
        return { ...prev, content: updatedContent };
      });

      await updateUserService(user.id, {
        status: newStatus,
      });

      AppToast({
        type: "success",
        message: "User status updated successfully",
      });
      setSelectedUserToggle(null);
      setIsToggleStatusDialogOpen(false);
    } catch (error: any) {
      AppToast({
        type: "error",
        message: "An error occurred while updating user status",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveUser = async (
    formData: CreateUserReq | { id: number; updates: UpdateUserReq }
  ) => {
    setIsSubmitting(true);
    try {
      if (mode === ModalMode.CREATE_MODE) {
        const createData = formData as CreateUserReq;

        const response = await createUserService({
          email: createData.email,
          fullName: createData.fullName,
          password: createData.password,
          role: createData.role,
          username: createData.username,
          position: createData.position,
          staffId: createData.staffId,
          phoneNumber: createData.phoneNumber,
          branch: createData.branch,
          department: createData.department,
        });

        // Optimistic update
        setUsers((prev: any) =>
          prev
            ? {
                ...prev,
                content: [response, ...prev.content],
                totalElements: prev.totalElements + 1,
              }
            : {
                content: [response],
                pageNo: 1,
                pageSize: 10,
                totalElements: 1,
                totalPages: 1,
                hasNext: false,
                hasPrevious: false,
                first: true,
                last: true,
              }
        );

        startTransition(() => {
          AppToast({
            type: "success",
            message: "User created successfully",
            description: "New User",
          });
        });
      } else if (mode === ModalMode.UPDATE_MODE) {
        const updateData = formData as { id: number; updates: UpdateUserReq };

        if (!updateData.id) {
          console.error("Missing user id in update form");
          setIsSubmitting(false);
          return;
        }

        const response = await updateUserService(
          updateData.id,
          updateData.updates
        );

        setUsers((prev) =>
          prev
            ? {
                ...prev,
                content: prev.content.map((user) =>
                  user.id === updateData.id ? response : user
                ),
              }
            : prev
        );

        startTransition(() => {
          AppToast({
            type: "success",
            message: "User updated successfully",
            description: "Updated User",
          });
        });
      }

      setIsModalOpen(false);
      setSelectedUser(null);
      loadUsers();
    } catch (err: any) {
      toast.error(err?.errorMessage || "Failed to save user");
      AppToast({
        type: "error",
        message: "Failed to save user",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      await deleteUserService(selectedUser.id);
      AppToast({
        type: "success",
        message: "User deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      loadUsers();
    } catch (err: any) {
      AppToast({
        type: "error",
        message: "Failed to delete user",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle status filter change - directly updates the filter value
  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
  };

  const handleEditUser = (user: UserModel) => {
    setSelectedUser(user);
    setMode(ModalMode.UPDATE_MODE);
    setIsModalOpen(true);
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setMode(ModalMode.CREATE_MODE);
    setIsModalOpen(true);
  };

  const handleViewUserDetail = (user: UserModel) => {
    setSelectedUser(user);
    setIsUserDetailOpen(true);
  };

  const handleDeleteUser = (user: UserModel) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleResetPassword = (user: UserModel) => {
    setSelectedUser(user);
    setIsResetPasswordDialogOpen(true);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="space-y-6 p-6 flex flex-col h-full">
        <div className="flex justify-between">
          <div className="flex flex-wrap items-center justify-start gap-4 w-full">
            <div className="relative w-full md:w-[350px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                // aria-label="search-users"
                autoComplete="search-user"
                type="search"
                placeholder="Search users..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-8 w-full min-w-[200px] text-xs md:min-w-[300px] h-9"
                disabled={isSubmitting}
              />
            </div>

          </div>
          <div className="flex items-center gap-2">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="h-9 w-[160px] text-xs">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_FILTER_WITH_ALL.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAddUser}>New</Button>
          </div>
        </div>

        <div className="w-full">
          <Separator className="bg-gray-300" />
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          {/* Table container with proper overflow handling */}
          <div className="flex-1 rounded-md border overflow-hidden flex flex-col">
            <div className="flex-1 overflow-x-auto">
              <DataTable
                data={users?.content || []}
                columns={createUserTableColumns({
                  data: users,
                  handlers: {
                    handleEditUser,
                    handleResetPassword,
                    handleViewUserDetail,
                    handleDeleteUser,
                  },
                  currentUser,
                })}
                loading={isLoading}
                emptyMessage="No user found"
                getRowKey={(user) => user.id}
              />
              {/* Pagination positioned to the right and outside the scrollable area */}
              <div className="border-t bg-background p-2 flex justify-end">
                <CustomPagination
                  currentPage={currentPage}
                  totalPages={users?.totalPages || 1}
                  onPageChange={handlePageChange}
                  size="md"
                />
              </div>
            </div>
          </div>
        </div>

        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setSelectedUser(null);
          }}
          onDelete={confirmDeleteUser}
          title="Delete Admin"
          description={`Are you sure you want to delete the admin`}
          itemName={selectedUser?.fullName || selectedUser?.email}
          isSubmitting={isSubmitting}
        />

        <ResetPasswordModal
          isOpen={isResetPasswordDialogOpen}
          userName={selectedUser?.fullName || selectedUser?.email}
          onClose={() => {
            setIsResetPasswordDialogOpen(false);
            setSelectedUser(null);
          }}
          userId={selectedUser?.id ?? 0}
        />

        <UserViewModal
          isOpen={isUserDetailOpen}
          onClose={() => {
            setIsUserDetailOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser ?? undefined}
        />

        <ModalUser
          isOpen={isModalOpen}
          mode={mode}
          onClose={() => {
            setSelectedUser(null);
            setIsModalOpen(false);
          }}
          onSave={handleSaveUser}
          userId={selectedUser?.id ?? 0}
          isSubmitting={isSubmitting}
        />

        {/* Confirm Dialog */}
        <ConfirmDialog
          isOpen={isToggleStatusDialogOpen}
          onClose={() => {
            setIsToggleStatusDialogOpen(false);
            setSelectedUserToggle(null);
          }}
          title="Change user status"
          description={`Are you sure you want to ${
            selectedUserToggle?.userStatus === "ACTIVE" ? "disable" : "enable"
          } this user: ${selectedUserToggle?.fullName}?`}
          cancelLabel="Cancel"
          onConfirm={() => handleStatusToggle(selectedUserToggle)}
          variant="warning"
          size="md"
        />
      </CardContent>
    </Card>
  );
}

export default function UserPage() {
  return (
    <Suspense fallback={<Loading />}>
      <UserPageContent />
    </Suspense>
  );
}
