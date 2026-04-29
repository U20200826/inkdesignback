// Product type matching the ink.prd_products table in Supabase
export type Product = {
    prd_code: number;
    prd_name: string;
};

// Inventory item — joins prd_products + inv_inventory + clr_colors
export type InventoryItem = {
    inv_code: number;
    inv_codprd: number;
    inv_description: string | null;
    inv_codclr: number | null;
    inv_entries: number;
    inv_outputs: number;
    inv_stock: number;
    inv_created_at: string;
    inv_last_updated: string | null;
    // Joined fields
    prd_name: string;
    clr_name: string | null;
    clr_exa: string | null;
};