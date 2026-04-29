"use client"

import {ColumnDef} from "@tanstack/react-table";
import {Package, Pencil} from "lucide-react";
import {Product} from "@/types/product";
import {DeleteButton} from "@/components/ui/DeleteButton";
import {deleteProduct} from "@/lib/actions/products";

export function getProductColumns(
    onEdit: (product: Product) => void,
    canEdit: boolean,  // Administrator only
    canDelete: boolean,  // Administrator only

):
ColumnDef<Product>[] {
    return [
        // ── Code column ──────────────────────────────────────────────────
        {
            accessorKey: "prd_code",
            header: "Code",
            size: 80,
            enableSorting: true,
            cell: ({row}) => (
                <span className="font-mono text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                    #{row.original.prd_code}
                    </span>
            ),
        },
        // ── Product name column ──────────────────────────────────────────
        {
            accessorKey: "prd_name",
            header: "Product Name",
            enableSorting: true,
            cell: ({row}) => (
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-brand-light flex items-center justify-center flex-shrink-0">
                        <Package size={13} className="text-brand"/>
                    </div>
                    <span className="font-medium text-gray-800">
                        {row.original.prd_name}
                    </span>
                </div>
            ),
        },
        // ── Actions column ───────────────────────────────────────────────
        {
            id: "actions",
            header: "",
            size: 90,
            enableSorting: false,
            cell: ({row}) => (
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Edit */}
                    <button
                        onClick={() => onEdit(row.original)}
                        title="Edit product"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-brand hover:bg-brand-light transition-colors"
                    >
                        <Pencil size={13} />
                    </button>
                    {/* Delete — only for Administrator */}

                    {canDelete && (
                        <DeleteButton
                            itemName={row.original.prd_name}
                            onDelete={() => deleteProduct(row.original.prd_code)}
                        />
                    )}
                </div>
            ),
        },
    ]
}