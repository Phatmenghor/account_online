import { axiosClient } from "@/utils/axios";
import { getRefreshToken } from "@/utils/local-storage/token";

export const refreshTokenService = async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;

    try {
        const response = await axiosClient.post("/api/v1/auth/refresh-token", {
            refreshToken,
        });
        return response.data;
    } catch (error) {
        console.error("Refresh token failed", error);
        throw error;
    }
};
