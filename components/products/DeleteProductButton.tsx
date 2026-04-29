// Delete button with inline confirmation to prevent accidental deletions
"use client";

import { useState, useTransition } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { deleteProduct } from "@/lib/actions/products";

type Props = {
    prd_code: number;
    prd_name: string;
};

export default function DeleteProductButton({ prd_code, prd_name }: Props) {
    // confirming = true means the user already clicked once and sees the confirm UI
    const [confirming, setConfirming] = useState(false);
    const [isPending, startTransition] = useTransition();

    function handleDelete() {
        startTransition(async () => {
            const result = await deleteProduct(prd_code);
            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
                setConfirming(false);
            }
        });
    }

    // First click — show confirm UI
    if (!confirming) {
        return (
            <button
                onClick={() => setConfirming(true)}
                title={`Delete ${prd_name}`}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
                <Trash2 size={13} />
            </button>
        );
    }

    // Second click — confirm or cancel
    return (
        <div className="flex items-center gap-1 bg-red-50 border border-red-100 rounded-lg px-2 py-1">
            <AlertTriangle size={11} className="text-red-400 flex-shrink-0" />
            <button
                onClick={handleDelete}
                disabled={isPending}
                className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50 transition-colors"
            >
                {isPending ? "Deleting..." : "Confirm"}
            </button>
            <span className="text-gray-300 text-xs">|</span>
            <button
                onClick={() => setConfirming(false)}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
                Cancel
            </button>
        </div>
    );
}