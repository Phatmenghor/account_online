import { UploadImageReq } from "@/features/account-opening/types/image.request";
import { axiosClientWithAuth } from "@/utils/axios";

export async function uploadImageService(data: UploadImageReq) {
  try {
    const response = await axiosClientWithAuth.post(`/api/images`, data);
    return response.data;
  } catch (error: any) {
    // Extract error message from response if available
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error upload image:", error);
    throw error;
  }
}

export function getImageService(imageId: string): string {
  if (!imageId) return "";
  if (imageId.startsWith("data:") || imageId.startsWith("http://") || imageId.startsWith("https://")) {
    return imageId;
  }
  const base = process.env.NEXT_PUBLIC_API_BASE_URL_IMAGE || process.env.NEXT_PUBLIC_API_BASE_URL || "";
  const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
  return `${cleanBase}/api/customer-images/${imageId}`;
}


