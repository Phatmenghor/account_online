import { z } from "zod";

// Schema for creating a province record
export const CreateProvinceSchema = z.object({
  provinceCode: z.string().min(1, "Province code is required"),
  provinceEn: z.string().min(1, "Province En is required"),
  provinceKh: z.string().min(1, "Province KH required"),
});

// Schema for updating a province record
export const UpdateProvinceSchema = z.object({
  id: z.number().optional(),
  provinceCode: z.string().optional(),
  provinceEn: z.string().optional(),
  provinceKh: z.string().optional(),
});

// Types inferred from schema
export type CreateProvinceForm = z.infer<typeof CreateProvinceSchema>;
export type UpdateProvinceForm = z.infer<typeof UpdateProvinceSchema>;
