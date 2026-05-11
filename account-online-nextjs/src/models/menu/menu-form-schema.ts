import * as z from "zod";
import { RoleEnum } from "./menu.types";

// Schema for parent menu creation
export const parentMenuSchema = z.object({
    title: z.string().min(1, "Parent title is required"),
    icon: z.string().optional(),
    href: z.string().optional(),
    displayOrder: z.coerce
        .number()
        .min(1, "Display order must be at least 1"),
    roles: z.array(z.nativeEnum(RoleEnum)).optional(),
    isActive: z.boolean().default(true),
});

// Main menu schema with three parent modes
export const menuSchema = z.object({
    title: z.string().min(1, "Title is required"),
    icon: z.string().optional(),
    href: z.string().optional(),
    parentMode: z.enum(["none", "existing", "new"]),
    parentId: z
        .union([z.string(), z.number()])
        .optional()
        .transform((val) => {
            if (val === null || val === undefined || val === "" || val === "0")
                return undefined;
            if (typeof val === "string") {
                const parsed = parseInt(val, 10);
                return isNaN(parsed) ? undefined : parsed;
            }
            return val;
        }),
    parentMenu: parentMenuSchema.optional(),
    displayOrder: z.coerce
        .number()
        .min(1, "Display order must be at least 1"),
    roles: z.array(z.nativeEnum(RoleEnum)).optional(),
    isActive: z.boolean(),
});

export type MenuFormValues = z.infer<typeof menuSchema>;
