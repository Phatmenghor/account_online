import { z } from "zod";

// Create District Schema
export const CreateDistrictSchema = z.object({
  districtCode: z.string().min(1, "District code is required"),
  districtEn: z.string().min(1, "District English name is required"),
  districtKh: z.string().min(1, "District Khmer name is required"),
  provinceCode: z.string().min(1, "Province code is required"),
});

// Update District Schema
export const UpdateDistrictSchema = z.object({
  id: z.number().optional(),
  districtCode: z.string().optional(),
  districtEn: z.string().optional(),
  districtKh: z.string().optional(),
  provinceCode: z.string().optional(),
});

export type CreateDistrictForm = z.infer<typeof CreateDistrictSchema>;
export type UpdateDistrictForm = z.infer<typeof UpdateDistrictSchema>;
