import { z } from "zod";

// Schema for creating a branch record
export const CreateBranchSchema = z.object({
  branchCode: z.string().min(1, "Branch Code is required"),
  branchKh: z.string().min(1, "Branch KH required"),
});

// Schema for updating a branch record
export const UpdateBranchSchema = z.object({
  id: z.number().optional(),
  branchCode: z.string().optional(),
  branchKh: z.string().optional(),
});

// Types inferred from schema
export type CreateBranchForm = z.infer<typeof CreateBranchSchema>;
export type UpdateBranchForm = z.infer<typeof UpdateBranchSchema>;
