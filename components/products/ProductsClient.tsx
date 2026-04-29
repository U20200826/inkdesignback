// Products client — connects DataTable with product columns and modals
"use client";

import {useState} from "react";
import { Plus } from "lucide-react";
import {Product} from "@/types/product";
import {AuthUser} from "@/types/auth";
import DataTable from "@/components/ui/datatable";
import {getProductColumns} from "@/components/products/columns";
import ProductFormModal from "./ProductFormModal";

type Props = {
    products: Product[];
    user: AuthUser;
};

export default function ProductsClient({products, user}: Props) {

    const [showCreate, setShowCreate] = useState(false);
    const [editProduct, setEditProduct] = useState<Product | null>(null);

    const isAdmin = user.role === "Administrator";

    // Pass onEdit callback into column definitions
    const columns = getProductColumns(
        (product) => setEditProduct(product),
        isAdmin, // canEdit
        isAdmin, // canDelete
    );

    return (
        <div className="flex flex-col gap-6 max-w-5xl mx-auto">

            {/* Page header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Products</h1>
                    <p className="text-sm text-gray-400 mt-0.5">
                        {products.length} products registered
                    </p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 bg-brand hover:bg-brand-hover text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus size={15}/>
                    New product
                </button>
            </div>

            {/* DataTable with pagination, search and sort */}
            <DataTable
                columns={columns}
                data={products}
                searchPlaceholder="Search products..."
                pageSize={10}
            />

            {/* Create modal */}
            {showCreate && (<ProductFormModal onClose={() => setShowCreate(false)}/>)}

            {/* Edit modal */}
            {editProduct && (<ProductFormModal product={editProduct} onClose={() => setEditProduct(null)}/>)}

        </div>






    )


}

