"use client"

import {useState} from "react";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {Archive, FileText, LayoutDashboard, Package, Settings, ShoppingCart, Truck, UserCog, Users, ChevronLeft, ChevronRight} from "lucide-react";
import LogoutButton from "@/components/ui/LogoutButton";
import {AuthUser} from "@/types/auth";

const NAV_MAIN = [
    {href: "/dashboard", label: "Dashboard", icon: LayoutDashboard},
    {href: "/dashboard/orders", label: "Orders", icon: ShoppingCart, badge: 12},
    {href: "/dashboard/products", label: "Products", icon: Package},
    {href: "/dashboard/customers", label: "Customers", icon: Users},
    {href: "/dashboard/purchases", label: "Purchases", icon: Truck},
];

const NAV_INVENTORY = [
    {href: "/dashboard/inventory", label: "Inventory", icon: Archive},
    {href: "/dashboard/reports", label: "Reports", icon: FileText},
];

const NAV_ADMIN = [
    {href: "/dashboard/users", label: "Users", icon: UserCog},
    {href: "/dashboard/settings", label: "Settings", icon: Settings},
];

type Props = {
    user: AuthUser;
}

export default function Sidebar({user}: Readonly<Props>) {

    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const isAdmin = user.role === "Administrator";

    function NavItem({href, label, icon: Icon, badge}: Readonly<{
        href: string;
        label: string;
        icon: React.ElementType;
        badge?: number;
    }>) {
        // Active if exact match or starts with href (for nested routes)
        const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
        return (
            <Link href={href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                          ? "bg-brand/10 text-brand"
                          : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  }`}
            >
                <Icon size={16} className="flex-shrink-0"/>
                <span className="flex-1">{label}</span>
                {badge && (
                    <span className="bg-brand text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                        {badge}
                      </span>
                )}
            </Link>
        );
    }

    return (
        <aside className={`${
            collapsed ? "w-16" : "w-56"
        } min-h-screen bg-white border-r border-gray-100 flex flex-col transition-all duration-300 ease-in-out relative`}
        >
            {/* Toggle button */}
            <button
                onClick={() => setCollapsed((v) => !v)}
                className="absolute -right-3 top-6 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors shadow-sm z-10"
            >
                {collapsed
                    ? <ChevronRight size={12}/>
                    : <ChevronLeft size={12}/>
                }
            </button>


            {/* Logo */}
            <div className="px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">I</span>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900 text-sm leading-none">INK</p>
                        <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wide">Management</p>
                    </div>
                </div>
            </div>
            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
                {/* Main section */}
                <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 mb-2">
                        Main
                    </p>
                    <div className="space-y-0.5">
                        {NAV_MAIN.map((item) => (
                            <NavItem key={item.href} {...item} />
                        ))}
                    </div>
                </div>
                {/* Inventory section */}
                <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 mb-2">
                        Inventory
                    </p>
                    <div className="space-y-0.5">
                        {NAV_INVENTORY.map((item) => (
                            <NavItem key={item.href} {...item} />
                        ))}
                    </div>
                </div>
                {/* Admin section */}
                <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 mb-2">
                        Admin
                    </p>
                    <div className="space-y-0.5">
                        {NAV_ADMIN.map((item) => (
                            <NavItem key={item.href} {...item} />
                        ))}
                    </div>
                </div>
            </nav>
            {/* User footer + logout */}
            <div className={`px-2 py-3 border-t border-gray-100 ${collapsed ? "flex justify-center" : ""}`}>
                {collapsed ? (
                    <LogoutButton variant="compact"/>
                ) : (
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2.5 px-3 py-2">
                            <div
                                className="w-7 h-7 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-xs font-bold">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-800 truncate">
                                    {user.name}
                                </p>
                                <p className="text-[10px] text-gray-400 truncate">
                                    {user.role}
                                </p>
                            </div>
                        </div>
                        <LogoutButton variant="full"/>
                    </div>
                )}
            </div>
        </aside>
    )
}