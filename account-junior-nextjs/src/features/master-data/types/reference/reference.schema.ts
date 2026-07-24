import { z } from "zod";

// Schema for creating a reference record
export const CreateReferenceSchema = z.object({
  nameEn: z.string().min(1, "English name is required"),
  nameKh: z.string().min(1, "Khmer name is required"),
  status: z.string().min(1, "Status is required"),
});

// Schema for updating a reference record
export const UpdateReferenceSchema = z.object({
  id: z.number().optional(),
  nameEn: z.string().optional(),
  nameKh: z.string().optional(),
  status: z.string().optional(),
});

// Types inferred from schema
export type CreateReferenceForm = z.infer<typeof CreateReferenceSchema>;
export type UpdateReferenceForm = z.infer<typeof UpdateReferenceSchema>;
