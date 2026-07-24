import { z } from "zod";

// Schema for creating a legal type record
export const CreateLegalTypeSchema = z.object({
  nameEn: z.string().min(1, "English name is required"),
  nameKh: z.string().min(1, "Khmer name is required"),
  legalTypeValue: z.string().min(1, "Legal type value is required"),
  status: z.string().min(1, "Status is required"),
});

// Schema for updating a legal type record
export const UpdateLegalTypeSchema = z.object({
  id: z.number().optional(),
  nameEn: z.string().optional(),
  nameKh: z.string().optional(),
  legalTypeValue: z.string().optional(),
  status: z.string().optional(),
});

// Types
export type CreateLegalTypeForm = z.infer<typeof CreateLegalTypeSchema>;
export type UpdateLegalTypeForm = z.infer<typeof UpdateLegalTypeSchema>;
