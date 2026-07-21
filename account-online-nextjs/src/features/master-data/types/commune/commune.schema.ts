import { z } from "zod";

// Schema for creating a commune
export const CreateCommuneSchema = z.object({
  communeCode: z.string().min(1, "Commune code is required"),
  communeEn: z.string().min(1, "Commune English name is required"),
  communeKh: z.string().min(1, "Commune Khmer name is required"),
  districtCode: z.string().min(1, "District code is required"),
});

// Schema for updating a commune
export const UpdateCommuneSchema = z.object({
  id: z.number().optional(),
  communeCode: z.string().optional(),
  communeEn: z.string().optional(),
  communeKh: z.string().optional(),
  districtCode: z.string().optional(),
});

export type CreateCommuneForm = z.infer<typeof CreateCommuneSchema>;
export type UpdateCommuneForm = z.infer<typeof UpdateCommuneSchema>;
