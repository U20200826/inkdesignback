// Generic reusable delete button with confirmation dialog
// Use this for any delete action across the entire app
"use client"

import {useState, useTransition} from "react";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

type ActionResult = {
    success:boolean;
    message: string;
}

type Props = {
    // Label shown in the confirmation dialog
    itemName: string;
    // The server action to call on confirm
    onDelete: () => Promise<ActionResult>;
    // Optional: disable the button
    disabled?: boolean;
}

export function DeleteButton({itemName, onDelete, disabled}: Readonly<Props>){
    const [showDialog, setShowDialog] = useState(false);
    const [isPending, startTransition] = useTransition();

    function handleConfirm(){
        startTransition(async () => {
           const result = await  onDelete();
           if (result.success){
               toast.success(result.message);
               setShowDialog(false);
           }else{
               toast.error(result.message);
               setShowDialog(false);
           }
        });
    }

    return (
        <>
            {/* Delete trigger button */}
            <button
                onClick={() => setShowDialog(true)}
                disabled={disabled}
                title={`Delete ${itemName}`}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
            >
                <Trash2 size={13} />
            </button>

            {/* Confirmation dialog */}
            {showDialog && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                    onClick={(e) => e.target === e.currentTarget && setShowDialog(false)}
                >
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">

                        {/* Dialog header */}
                        <div className="px-6 pt-6 pb-4 flex flex-col items-center text-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                                <AlertTriangle size={22} className="text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-gray-900">
                                    Delete {itemName}?
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    This action cannot be undone. This will permanently
                                    delete{" "}
                                    <span className="font-medium text-gray-700">
                                        {itemName}
                                    </span>{" "}
                                    from the system.
                                </p>
                            </div>
                        </div>

                        {/* Dialog actions */}
                        <div className="px-6 pb-6 flex gap-3">
                            <button
                                onClick={() => setShowDialog(false)}
                                disabled={isPending}
                                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={isPending}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-60"
                            >
                                {isPending && (
                                    <Loader2 size={13} className="animate-spin" />
                                )}
                                {isPending ? "Deleting..." : "Yes, delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
