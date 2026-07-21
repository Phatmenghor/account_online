import { z } from "zod";

// Schema for creating a village
export const CreateVillageSchema = z.object({
  villageCode: z.string().min(1, "Village code is required"),
  villageEn: z.string().min(1, "Village English name is required"),
  villageKh: z.string().min(1, "Village Khmer name is required"),
  communeCode: z.string().min(1, "Commune code is required"),
});

// Schema for updating a village
export const UpdateVillageSchema = z.object({
  id: z.number().optional(),
  villageCode: z.string().optional(),
  villageEn: z.string().optional(),
  villageKh: z.string().optional(),
  communeCode: z.string().optional(),
});

export type CreateVillageForm = z.infer<typeof CreateVillageSchema>;
export type UpdateVillageForm = z.infer<typeof UpdateVillageSchema>;
