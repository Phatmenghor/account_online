import { z } from "zod";

export const UpdateUserProfileSchema = z.object({
  username: z.string().optional(),
  email: z.string().optional(),
  fullName: z.string().optional(),
  status: z.string().optional(),
  profileUrl: z.string().optional(),
  position: z.string().optional(),
  staffId: z.string().optional(),
  phoneNumber: z.string().optional(),
  branch: z.string().optional(),
  department: z.string().optional(),
  id: z.number().optional(),
});

export type UpdateUserProfileForm = z.infer<typeof UpdateUserProfileSchema>;
