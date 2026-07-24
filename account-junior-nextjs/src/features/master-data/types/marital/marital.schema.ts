import { z } from "zod";

// Schema for creating a marital record
export const CreateMaritalSchema = z.object({
  nameEn: z.string().min(1, "English name is required"),
  nameKh: z.string().min(1, "Khmer name is required"),
  status: z.string().min(1, "Status is required"),
});

// Schema for updating a marital record
export const UpdateMaritalSchema = z.object({
  id: z.number().optional(),
  nameEn: z.string().optional(),
  nameKh: z.string().optional(),
  status: z.string().optional(),
});

// Types inferred from schema
export type CreateMaritalForm = z.infer<typeof CreateMaritalSchema>;
export type UpdateMaritalForm = z.infer<typeof UpdateMaritalSchema>;
