
export type UserRole = "Administrator" | "Employee";

export type AuthUser = {
    code: number;
    name: string;
    user: string;
    role: UserRole;
}
