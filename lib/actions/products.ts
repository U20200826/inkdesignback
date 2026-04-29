// Product Server Actions — safe to import in client components
// "use server" marks every function here as a server action
"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ProductSchema } from "@/lib/validations/product";
import { z } from "zod";

// ─── Server Actions ───────────────────────────────────────────────────────────

type ActionResult = {
    success: boolean;
    message: string;
    errors?: Record<string, string[]>;
};

// Helper — creates supabase client with current cookies
async function getSupabase() {
    const cookieStore = await cookies();
    return createClient(cookieStore);
}


// CREATE product
export async function createProduct(formData: z.infer<typeof ProductSchema>): Promise<ActionResult>{

    const validated = ProductSchema.safeParse(formData);

    if(!validated.success){
        return {
            success: false,
            message: "Please fix the form errors",
            errors: z.flattenError(validated.error).fieldErrors
        };
    }

    try {

        const supabase = await getSupabase();

        // Check for duplicate name
        const {data: existing} = await supabase
            .from("prd_products")
            .select("prd_code")
            .ilike("prd_name", validated.data.prd_name)
            .single();

        if(existing){
            return {
                success: false,
                message: "A product with this name already exists"
            };
        }

        // Get next code (auto-increment pattern from original DB)
        const {data: maxRow} = await supabase
            .from("prd_products")
            .select("prd_code")
            .order("prd_code", { ascending: false })
            .limit(1)
            .single();

        const nextCode = (maxRow?.prd_code ?? 0) + 1;

        const {error}  = await supabase
            .from("prd_products")
            .insert({
                prd_code: nextCode,
                prd_name: validated.data.prd_name
            });

        if (error) throw new Error(error.message);

        revalidatePath("/dashboard/products")
        return {success: true, message: "Product created successfully"};
    }catch (error: any) {
        console.error("createProduct error:", error);
        return {success: false, message: "Failed to create product"};
    }
}

// UPDATE product
export async function updateProduct(code:number, formData: z.infer<typeof ProductSchema>): Promise<ActionResult>{

    const validated = ProductSchema.safeParse(formData);

    if(!validated.success){
        return {
            success: false,
            message: "Please fix the form errors",
            errors: z.flattenError(validated.error).fieldErrors
        };
    }

    try {

        const supabase = await getSupabase();

        // Check duplicate — excluding current product
        const {data: existing} = await supabase
            .from("prd_products")
            .select("prd_code")
            .ilike("prd_name", validated.data.prd_name)
            .neq("prd_code", code)
            .single();

        if(existing){
            return {
                success: false,
                message: "A product with this name already exists"
            };
        }

        const {error}  = await supabase
            .from("prd_products")
            .update({ prd_name: validated.data.prd_name})
            .eq("prd_code", code);

        if (error) throw new Error(error.message);

        revalidatePath("/dashboard/products")
        return {success: true, message: "Product updated successfully"};
    }catch (error: any) {
        console.error("updateProduct  error:", error);
        return {success: false, message: "Failed to update product"};
    }
}

// Delete product
export async function deleteProduct(code:number): Promise<ActionResult>{

    try {

        const supabase = await getSupabase();

        // Check if product has inventory linked before deleting
        const {data: inventory} = await supabase
            .from("inv_inventory")
            .select("inv_code")
            .eq("inv_codprd", code)
            .limit(1)
            .single();

        if(inventory){
            return {
                success: false,
                message: "Cannot delete — this product has inventory records"
            };
        }

        const {error}  = await supabase
            .from("prd_products")
            .delete()
            .eq("prd_code", code);

        if (error) throw new Error(error.message);

        revalidatePath("/dashboard/products")
        return {success: true, message: "Product deleted successfully"};
    }catch (error: any) {
        console.error("updateProduct  error:", error);
        return {success: false, message: "Failed to delete product"};
    }
}