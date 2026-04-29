import {redirect} from "next/navigation";
import {getSession} from "@/lib/session/session.server";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import { Toaster } from "sonner";

export default async function DashboardLayout({children,}: Readonly<{ children: React.ReactNode; }>) {
    const user = await getSession();
    if (!user) redirect("/login")

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar receives user for role-based navigation */}
            <Sidebar user={user}/>
            {/* Right side: topbar + page content */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Topbar/>
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
            <Toaster
                position="bottom-right"
                toastOptions={{
                    style: {
                        background: "white",
                        border: "1px solid #f3f4f6",
                        borderRadius: "12px",
                        fontSize: "13px",
                    },
                }}
            />
        </div>
    );
}