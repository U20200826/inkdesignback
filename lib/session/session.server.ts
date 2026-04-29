// Server-only session helper — reads cookie from next/headers
// Import this ONLY in Server Components, layouts, and Server Actions
"use server";

import { cookies } from "next/headers";
import { AuthUser } from "@/types/auth";

// Get current session from cookie — returns null if not authenticated
export async function getSession(): Promise<AuthUser | null> {
    try {
        const cookieStore = await cookies();
        const raw = cookieStore.get("ink_session")?.value;
        if (!raw) return null;
        return JSON.parse(raw) as AuthUser;
    } catch {
        return null;
    }
}

// Check if current user is Administrator
export async function requireAdmin(): Promise<AuthUser> {
    const user = await getSession();
    if (!user) throw new Error("Unauthenticated");
    if (user.role !== "Administrator") throw new Error("Unauthorized");
    return user;
}

export async function isAdmin(user: AuthUser | null): Promise<boolean>{
    return user?.role === "Administrator";
}
