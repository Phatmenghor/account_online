"use client";

import React from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { MenuItemDto, RoleEnum } from "@/models/menu/menu.types";
import { menuSchema, MenuFormValues } from "@/models/menu/menu-form-schema";
import { ParentMode } from "@/models/menu/mode";
import { ModalMode } from "@/constants/AppResource/display-list/enum/mode";

interface MenuFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: ModalMode;
  menuData?: MenuItemDto | null;
  allMenus: MenuItemDto[];
  onSubmit: (values: MenuFormValues) => Promise<void>;
}

export function MenuFormModal({
  isOpen,
  onClose,
  mode,
  menuData,
  allMenus,
  onSubmit,
}: MenuFormModalProps) {
  const form = useForm<MenuFormValues>({
    resolver: zodResolver(menuSchema) as Resolver<MenuFormValues>,
    defaultValues: menuData
      ? {
          title: menuData.title,
          icon: menuData.icon || "",
          href: menuData.href || "",
          parentMode: menuData.parentId ? "existing" : "none",
          parentId: menuData.parentId ?? undefined,
          parentMenu: undefined,
          displayOrder: menuData.displayOrder,
          roles: menuData.roles,
          isActive: menuData.isActive,
        }
      : {
          title: "",
          icon: "",
          href: "",
          parentMode: "none" as ParentMode,
          parentId: undefined,
          parentMenu: undefined,
          displayOrder: 1,
          roles: [],
          isActive: true,
        },
  });

  const parentMode = form.watch("parentMode");

  // Reset form when modal opens/closes or data changes
  React.useEffect(() => {
    if (isOpen) {
      if (menuData) {
        form.reset({
          title: menuData.title,
          icon: menuData.icon || "",
          href: menuData.href || "",
          parentMode: menuData.parentId ? "existing" : "none",
          parentId: menuData.parentId ?? undefined,
          parentMenu: undefined,
          displayOrder: menuData.displayOrder,
          roles: menuData.roles,
          isActive: menuData.isActive,
        });
      } else {
        form.reset({
          title: "",
          icon: "",
          href: "",
          parentMode: "none",
          parentId: undefined,
          parentMenu: undefined,
          displayOrder: 1,
          roles: [],
          isActive: true,
        });
      }
    }
  }, [isOpen, menuData, form]);

  const handleSubmit = async (values: MenuFormValues) => {
    // Clean up the values based on parent mode before submission
    const submitValues = { ...values };

    if (values.parentMode === "none") {
      delete submitValues.parentId;
      delete submitValues.parentMenu;
    } else if (values.parentMode === "existing") {
      delete submitValues.parentMenu;
    } else if (values.parentMode === "new") {
      delete submitValues.parentId;
    }

    // Remove the parentMode field as it's not part of the API
    delete (submitValues as any).parentMode;

    await onSubmit(submitValues);
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full max-h-[90vh] p-0 flex flex-col gap-0">
        <DialogHeader className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <DialogTitle>
            {mode === ModalMode.UPDATE_MODE ? "Edit Menu" : "Create Menu"}
          </DialogTitle>
          <DialogDescription>
            {mode === ModalMode.UPDATE_MODE
              ? "Update the menu details below."
              : "Enter the details for the new menu."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={
              form.handleSubmit(
                handleSubmit
              ) as React.FormEventHandler<HTMLFormElement>
            }
            className="flex flex-col flex-1 min-h-0"
          >
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Menu Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Dashboard" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Icon and Display Order */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon</FormLabel>
                      <FormControl>
                        <Input placeholder="dashboard" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="displayOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Href */}
              <FormField
                control={form.control}
                name="href"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Href</FormLabel>
                    <FormControl>
                      <Input placeholder="/dashboard" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Parent Mode Selection */}
              <FormField
                control={form.control}
                name="parentMode"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Parent Menu Option</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-3 space-y-0">
                          <RadioGroupItem value="none" id="none" />
                          <Label
                            htmlFor="none"
                            className="font-normal cursor-pointer"
                          >
                            No Parent (Root Menu)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3 space-y-0">
                          <RadioGroupItem value="existing" id="existing" />
                          <Label
                            htmlFor="existing"
                            className="font-normal cursor-pointer"
                          >
                            Select Existing Parent
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3 space-y-0">
                          <RadioGroupItem value="new" id="new" />
                          <Label
                            htmlFor="new"
                            className="font-normal cursor-pointer"
                          >
                            Create New Parent Menu
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormDescription>
                      Choose how to set the parent menu for this item
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Existing Parent Selector */}
              {parentMode === "existing" && (
                <FormField
                  control={form.control}
                  name="parentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Parent Menu</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value?.toString()}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a parent menu" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {allMenus
                            .filter((m) => m.id !== menuData?.id)
                            .map((menu) => (
                              <SelectItem
                                key={menu.id}
                                value={menu.id.toString()}
                              >
                                {menu.title}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* New Parent Menu Fields */}
              {parentMode === "new" && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                  <h4 className="font-semibold text-sm">
                    New Parent Menu Details
                  </h4>

                  {/* Parent Title */}
                  <FormField
                    control={form.control}
                    name="parentMenu.title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Reports" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Parent Icon and Display Order */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="parentMenu.icon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parent Icon</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., folder" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="parentMenu.displayOrder"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parent Order</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Parent Href */}
                  <FormField
                    control={form.control}
                    name="parentMenu.href"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent Href (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="/reports" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Parent Roles */}
                  <FormField
                    control={form.control}
                    name="parentMenu.roles"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent Roles</FormLabel>
                        <div className="flex flex-wrap gap-2 border p-2 rounded-md">
                          {Object.values(RoleEnum).map((role) => (
                            <div
                              key={role}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                checked={field.value?.includes(role)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  if (checked) {
                                    field.onChange([...current, role]);
                                  } else {
                                    field.onChange(
                                      current.filter((r) => r !== role)
                                    );
                                  }
                                }}
                              />
                              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {role}
                              </label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Roles */}
              <FormField
                control={form.control}
                name="roles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Roles</FormLabel>
                    <div className="flex flex-wrap gap-2 border p-2 rounded-md">
                      {Object.values(RoleEnum).map((role) => (
                        <div key={role} className="flex items-center space-x-2">
                          <Checkbox
                            checked={field.value?.includes(role)}
                            onCheckedChange={(checked) => {
                              const current = field.value || [];
                              if (checked) {
                                field.onChange([...current, role]);
                              } else {
                                field.onChange(
                                  current.filter((r) => r !== role)
                                );
                              }
                            }}
                          />
                          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {role}
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Is Active */}
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Active</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-between items-center p-6 border-t bg-muted/30 flex-shrink-0 gap-4">
              <Button type="submit">
                {mode === ModalMode.UPDATE_MODE ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
