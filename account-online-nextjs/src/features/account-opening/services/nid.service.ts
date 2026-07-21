import {
  RequestIdImage,
  RequestValidModel,
} from "@/features/account-opening/types/nid.request.model";
import { ValidationResponse } from "@/features/account-opening/types/nid.response.model";
import { axiosClientWithAuth } from "@/utils/axios";
import { AxiosError } from "axios";

// export async function extractNIDService(data: RequestIdImage) {
//   try {
//     const response = await createAxiosCamdx.post("/api/v1/ocr-idcard", {
//       idImage: data.idImage,
//     });

//     return response.data;
//   } catch (error: any) {
//     // Don't return null - throw the error so it can be handled properly
//     throw error;
//   }
// }
export async function extractNIDService(data: RequestIdImage) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/public/nid/extract",
      {
        idImage: data.idImage,
      }
    );

    return response.data.data.data;
  } catch (error: any) {
    // Don't return null - throw the error so it can be handled properly
    throw error;
  }
}

// export async function extractNIDService(data: RequestIdImage) {
//   try {
//     console.log("=== SENDING REQUEST ===");
//     console.log("Application Name:", data.applicationName);
//     console.log("Image length:", data.idImage?.length);
//     console.log("Request payload:", {
//       applicationName: data.applicationName,
//       idImage: data.idImage?.substring(0, 50) + "..." // First 50 chars
//     });

//     const response = await axiosClientWithAuth.post("/api/v1/public/nid/extract", {
//       applicationName: data.applicationName,
//       idImage: data.idImage,
//     });

//     console.log("=== RESPONSE RECEIVED ===");
//     console.log("Full response:", response);
//     console.log("Response data:", response.data);

//     return response.data.data.data;
//   } catch (error: any) {
//     console.error("=== ERROR DETAILS ===");
//     console.error("Error:", error);
//     console.error("Error response:", error.response);
//     console.error("Error status:", error.response?.status);
//     console.error("Error data:", error.response?.data);
//     throw error;
//   }
// }

// Interfaces for Validate NID
interface SuccessResponse {
  status: string;
  errorMessage: string;
  data: ValidationResponse;
}

interface ErrorResponse {
  timestamp: string;
  status: number;
  message: string;
}

// Validate NID Service
export async function validateNIDService(data: RequestValidModel) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/public/nid/validate`,
      data
    );
    // Return full response: { status: "success", message: "NID validated successfully", data: { error, message, data } }
    return response.data.data;
  } catch (err) {
    const error = err as AxiosError<ErrorResponse>;
    // Throw the backend error directly
    throw error;
  }
}

