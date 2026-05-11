import { UploadImageReq } from "@/models/image/image.request";
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
  // Return the full API URL for the image
  return `http://192.168.103.106:9393/api/images/${imageId}`;
}
