// Product queries using Supabase client
import {createClient} from "@/utils/supabase/server";
import {cookies } from "next/headers";
import {Product} from "@/types/product";

// Helper — creates supabase client with current cookies
async function getSupabase() {
    const cookieStore = await cookies();
    return createClient(cookieStore);
}

// ─── Queries ─────────────────────────────────────────────────────────────────

// Get all products ordered by code
export async function getProducts(): Promise<Product[]> {

    const supabase = await getSupabase();

    const {data, error} = await supabase
        .from('prd_products')
        .select('prd_code, prd_name')
        .order("prd_code", {ascending: true});

    if (error) throw new Error(error.message);

    return data ?? [];
}

// Get all products ordered by code





















