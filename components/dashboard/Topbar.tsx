"use client"

import {Bell, Plus, Search} from "lucide-react";

type Props = {
    title?: string;
}

export default function Topbar({title = "Overview"}: Readonly<Props>) {
    return (
        <header
            className="h-14 min-h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 gap-4">
            {/* Page title */}
            <h1 className="text-sm font-semibold text-gray-800">{title}</h1>

            {/* Right side controls */}
            <div className="flex items-center gap-3">
                {/* Search */}
                <div
                    className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 min-w-[200px]">
                    <Search size={13} className="text-gray-400 flex-shrink-0"/>
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent text-xs outline-none text-gray-700 placeholder:text-gray-400 w-full"
                    />
                </div>

                {/* Notifications */}
                <button
                    className="relative w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                    <Bell size={14}/>
                    {/* Unread dot */}
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand rounded-full"/>
                </button>

                {/* New order button */}
                <button
                    className="flex items-center gap-1.5 bg-brand hover:bg-brand-hover text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors">
                    <Plus size={13}/>
                    New order
                </button>
            </div>
        </header>
    )
}