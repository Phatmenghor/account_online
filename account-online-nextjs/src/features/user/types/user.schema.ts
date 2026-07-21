import { z } from "zod";

export const UpdateUserSchema = z.object({
  id: z.number().min(1, "User ID is required"),
  email: z.string().email("Invalid email format").optional(),
  fullName: z.string().optional(),
  status: z.string().optional(),
  position: z.string().optional(),
  profileUrl: z.string().optional(),
  phoneNumber: z.string().optional(),
  branch: z.string().optional(),
  department: z.string().optional(),
  userRole: z.string().optional(),
});

export type UpdateUserForm = z.infer<typeof UpdateUserSchema>;

export const CreateUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().optional(),
  role: z.string().min(1, "Role is required"),
  position: z.string().optional(),
  profileUrl: z.string().optional(),
  phoneNumber: z.string().optional(),
  branch: z.string().optional(),
  department: z.string().optional(),
});

export type CreateUserForm = z.infer<typeof CreateUserSchema>;
