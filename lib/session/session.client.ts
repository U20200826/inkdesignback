// Client-side session helper — works with session passed as props
// Use this in "use client" components that receive user from server
import { AuthUser, UserRole } from "@/types/auth";

// Check if user has admin role
export function isAdmin(user: AuthUser | null): boolean {
    return user?.role === "Administrator";
}

// Check if user has a specific role
export function hasRole(user: AuthUser | null, role: UserRole): boolean {
    return user?.role === role;
}

// Check if user can perform edit actions
// Administrator → yes | employee → no
export function canEdit(user: AuthUser | null): boolean {
    return user?.role === "Administrator";
}

// Check if user can perform delete actions
// Administrator → yes | employee → no
export function canDelete(user: AuthUser | null): boolean {
    return user?.role === "Administrator";
}

// Check if user can create records
// All roles → yes
export function canCreate(_user: AuthUser | null): boolean {
    return true;
}