import { axiosServer } from "@/utils/axios";

const stripBase64Prefix = (base64Full: string): string => {
  if (base64Full.includes(",")) {
    return base64Full.split(",")[1];
  }
  return base64Full;
};

export const uploadDocument = async (
  base64Full: string,
  filename: string,
  type: string,
  legalId?: string,
): Promise<string> => {
  const base64 = stripBase64Prefix(base64Full);

  if (!base64 || base64.trim() === "") {
    throw new Error(`Upload failed: empty base64 data for ${type}`);
  }

  const juniorType = type.toLowerCase().startsWith("junior") ? type : `junior_${type}`;

  try {
    const response = await axiosServer.post("/api/public/upload", {
      fileBase64: base64,
      fileName: filename,
      type: juniorType,
      legalId,
    });

    if (response.data?.filename) {
      return response.data.filename;
    }
    throw new Error(response.data?.message || `Upload failed: no filename returned for ${type}`);
  } catch (error: any) {
    const msg = error.response?.data?.message || error.response?.data?.error || error.message || `Upload failed for ${type}`;
    throw new Error(msg);
  }
};
