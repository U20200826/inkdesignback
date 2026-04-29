// Zod schema for product form validation
import { z } from "zod";

export const ProductSchema = z.object({
    prd_name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name cannot exceed 50 characters")
        .trim(),
});

export type ProductFormData = z.infer<typeof ProductSchema>;