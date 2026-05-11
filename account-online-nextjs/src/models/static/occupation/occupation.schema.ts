import { z } from "zod";

// Schema for creating a occupation record
export const CreateOccupationSchema = z.object({
  nameEn: z.string().min(1, "English name is required"),
  nameKh: z.string().min(1, "Khmer name is required"),
  occupationCode: z.string().min(1, "Occupation is required"),
  status: z.string().min(1, "Status is required"),
});

// Schema for updating a occupation record
export const UpdateOccupationSchema = z.object({
  id: z.number().optional(),
  nameEn: z.string().optional(),
  nameKh: z.string().optional(),
  occupationCode: z.string().optional(),
  status: z.string().optional(),
});

// Types inferred from schema
export type CreateOccupationForm = z.infer<typeof CreateOccupationSchema>;
export type UpdateOccupationForm = z.infer<typeof UpdateOccupationSchema>;
