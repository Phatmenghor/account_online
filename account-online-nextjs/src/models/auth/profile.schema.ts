import { z } from "zod";

// UpdateUserReq schema (all fields optional)
export const UpdateUserProfileSchema = z.object({
  username: z.string().optional(),
  email: z.string().optional(),
  fullName: z.string().optional(),
  status: z.string().optional(),
  profileUrl: z.string().optional(),
  position: z.string().optional(),
  id: z.number().optional(),
});

export type UpdateUserProfileForm = z.infer<typeof UpdateUserProfileSchema>;
