import { MenuItemDto, RoleEnum } from "./menu.types";

export interface MenuResponseDto {
    id: number;
    title: string;
    icon: string | null;
    href: string | null;
    parentId: number | null;
    displayOrder: number;
    roles: RoleEnum[];
    allowedUserIds: number[];
    isActive: boolean;
    children: MenuResponseDto[];
}

export interface AllMenuResponseDto {
    content: MenuItemDto[];
    pageNo: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}

export interface ApiResponse<T> {
    status: string;
    message: string;
    data: T;
}
