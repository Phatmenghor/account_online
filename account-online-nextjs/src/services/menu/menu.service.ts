import { axiosClientWithAuth } from "@/utils/axios";
import {
    AllMenuResponseDto,
    ApiResponse,
    MenuResponseDto,
} from "@/models/menu/menu.response";
import {
    AssignMenuToUserRequestDto,
    AssignMenusToUserRequestDto,
    GetAllMenuRequestDto,
    MenuCreateRequestDto,
    MenuUpdateRequestDto,
} from "@/models/menu/menu.request";

const BASE_URL = "/api/v1/menu";

export const menuService = {
    getCurrentUserMenus: async (): Promise<MenuResponseDto[]> => {
        const response = await axiosClientWithAuth.post<ApiResponse<MenuResponseDto[]>>(
            `${BASE_URL}/current`
        );
        return response.data.data;
    },

    getUserMenus: async (userId: number): Promise<MenuResponseDto[]> => {
        const response = await axiosClientWithAuth.post<ApiResponse<MenuResponseDto[]>>(
            `${BASE_URL}/user/${userId}`
        );
        return response.data.data;
    },

    getAllMenus: async (
        request: GetAllMenuRequestDto
    ): Promise<AllMenuResponseDto> => {
        const response = await axiosClientWithAuth.post<ApiResponse<AllMenuResponseDto>>(
            `${BASE_URL}`,
            request
        );
        return response.data.data;
    },

    getMenuById: async (id: number): Promise<MenuResponseDto> => {
        const response = await axiosClientWithAuth.post<ApiResponse<MenuResponseDto>>(
            `${BASE_URL}/getById/${id}`
        );
        return response.data.data;
    },

    createMenu: async (
        request: MenuCreateRequestDto
    ): Promise<MenuResponseDto> => {
        const response = await axiosClientWithAuth.post<ApiResponse<MenuResponseDto>>(
            `${BASE_URL}/create`,
            request
        );
        return response.data.data;
    },

    updateMenu: async (
        id: number,
        request: MenuUpdateRequestDto
    ): Promise<MenuResponseDto> => {
        const response = await axiosClientWithAuth.post<ApiResponse<MenuResponseDto>>(
            `${BASE_URL}/updateById/${id}`,
            request
        );
        return response.data.data;
    },

    deleteMenu: async (id: number): Promise<MenuResponseDto> => {
        const response = await axiosClientWithAuth.post<ApiResponse<MenuResponseDto>>(
            `${BASE_URL}/deleteById/${id}`
        );
        return response.data.data;
    },

    assignUsersToMenu: async (
        menuId: number,
        request: AssignMenuToUserRequestDto
    ): Promise<MenuResponseDto> => {
        const response = await axiosClientWithAuth.post<ApiResponse<MenuResponseDto>>(
            `${BASE_URL}/${menuId}/assign-users`,
            request
        );
        return response.data.data;
    },

    removeUsersFromMenu: async (
        menuId: number,
        userIds: number[]
    ): Promise<MenuResponseDto> => {
        const response = await axiosClientWithAuth.post<ApiResponse<MenuResponseDto>>(
            `${BASE_URL}/${menuId}/remove-users`,
            userIds
        );
        return response.data.data;
    },

    assignMenusToUser: async (
        request: AssignMenusToUserRequestDto
    ): Promise<MenuResponseDto[]> => {
        const response = await axiosClientWithAuth.post<ApiResponse<MenuResponseDto[]>>(
            `${BASE_URL}/user/assign-menus`,
            request
        );
        return response.data.data;
    },
};
