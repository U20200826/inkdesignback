// Zod schema for form validation
import { z } from "zod";

export const AuthSchema = z.object({
    user: z
        .string()
        .min(1, "Username is required")
        .trim(),
    pwd: z
        .string()
        .min(1, "Password is required"),
});

export type AuthFormData = z.infer<typeof AuthSchema>;