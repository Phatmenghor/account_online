import { RoleEnum } from "./menu.types";

/**
 * DTO for creating a new parent menu on-the-fly
 */
export interface ParentMenuDto {
    title: string;           // Required
    icon?: string;           // Optional
    href?: string;           // Optional
    displayOrder: number;    // Required
    roles?: RoleEnum[];      // Optional
    isActive?: boolean;      // Default: true
}

/**
 * Request DTO for creating a menu
 * Supports three modes:
 * 1. Root menu: neither parentId nor parentMenu provided
 * 2. Existing parent: only parentId provided
 * 3. New parent: only parentMenu provided
 * Note: parentId and parentMenu are mutually exclusive
 */
export interface MenuCreateRequestDto {
    title: string;
    icon?: string;
    href?: string;
    parentId?: number;           // Option 1: Use existing parent menu by ID
    parentMenu?: ParentMenuDto;  // Option 2: Create new parent menu
    displayOrder: number;
    roles?: RoleEnum[];
    allowedUserIds?: number[];
    isActive?: boolean;
}

export interface MenuUpdateRequestDto {
    title?: string;
    icon?: string;
    href?: string;
    parentId?: number;
    displayOrder?: number;
    roles?: RoleEnum[];
    allowedUserIds?: number[];
    isActive?: boolean;
}

export interface GetAllMenuRequestDto {
    pageNo?: number;
    pageSize?: number;
    search?: string;
    isActive?: boolean;
    parentId?: number;
}

export interface AssignMenuToUserRequestDto {
    userIds: number[];
}

export interface AssignMenusToUserRequestDto {
    userId: number;
    menuIds: number[];
}

