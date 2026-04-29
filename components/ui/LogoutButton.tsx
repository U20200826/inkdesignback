"use client";

import {useTransition} from "react";
import { LogOut, Loader2 } from "lucide-react";
import { logoutAction} from "@/lib/actions/auth";

type Props = {
    // compact = just icon, full = icon + label
    variant?: "compact" | "full"
}

export default function LogoutButton({ variant= "full"}: Readonly<Props>){

    const[isPending, startTransition] = useTransition();
    function handleLogout() {
        startTransition(async () =>{
            await logoutAction();
        })
    }

    if(variant === "compact"){
        return (
            <button
            onClick={handleLogout}
            disabled={isPending}
            title="Sing out"
            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
                {isPending
                    ? <Loader2 size={15} className="animate-spin" />
                    : <LogOut size={15} />
                }
            </button>
        )
    }
    return (
        <button
            onClick={handleLogout}
            disabled={isPending}
            title="Sing out"
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
            {isPending
                ? <Loader2 size={14} className="animate-spin" />
                : <LogOut size={14} />
            }
            {isPending ? "Signing out..." : "Sign out"}
        </button>
    )


}