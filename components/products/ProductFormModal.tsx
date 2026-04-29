"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { X, Package, Loader2 } from "lucide-react";
import { Product } from "@/types/product";
import { ProductSchema, ProductFormData } from "@/lib/validations/product";
import { createProduct, updateProduct } from "@/lib/actions/products";

type Props = {
    product?: Product,
    onClose: () => void
}

export default function ProductFormModal({product, onClose}: Props) {

    const isEditing = !!product;
    const {
        register,
        handleSubmit,
        setFocus,
        formState: {errors, isSubmitting}
    } = useForm<ProductFormData>({
        resolver: zodResolver(ProductSchema),
        defaultValues: {
            prd_name: product?.prd_name ?? ""
        }
    })

    // Auto-focus the name input when modal opens
    useEffect(() => {
        setFocus("prd_name");
    }, [setFocus]);

    // Close modal on Escape key
    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }

        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey)
    }, [onClose]);

    async function onSubmit(data: ProductFormData) {
         const result = isEditing
            ? await updateProduct(product?.prd_code, data)
            : await createProduct(data);

         if(result.success){
             toast.success(result.message);
             onClose()
         }else{
             toast.error(result.message);
         }

    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && onClose()}>

            {/* Modal card */}
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-light flex items-center justify-center">
                            <Package size={15} className="text-brand"/>
                        </div>
                        <h2 className="text-sm font-semibold text-gray-900">
                            {isEditing ? "Edit product" : "New product"}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <X size={14}/>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 flex flex-col gap-4">
                    {/* Product name field */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-gray-700">
                            Product name <span className="text-red-400">*</span>
                        </label>
                        <input
                            {...register("prd_name")}
                            type="text"
                            placeholder="e.g. Cotton Shirt"
                            className={`w-full px-3 py-2 text-sm rounded-lg border outline-none transition-colors
                ${errors.prd_name
                                ? "border-red-300 bg-red-50 focus:border-red-400"
                                : "border-gray-200 bg-gray-50 focus:border-brand focus:bg-white"
                            }`}
                        />
                        {/* Inline field error */}
                        {errors.prd_name && (
                            <p className="text-xs text-red-500">{errors.prd_name.message}</p>
                        )}
                    </div>

                    {/* Footer buttons */}
                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand hover:bg-brand-hover rounded-lg transition-colors disabled:opacity-60"
                        >
                            {isSubmitting && <Loader2 size={13} className="animate-spin" />}
                            {isSubmitting
                                ? "Saving..."
                                : isEditing
                                    ? "Save changes"
                                    : "Create product"}
                        </button>
                    </div>
                </form>


            </div>
        </div>
    )

}