// Authentication Server Actions
"use server";

import {createClient} from "@/utils/supabase/server";
import {cookies} from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import {AuthSchema} from "@/lib/validations/auth";
import {z} from "zod";
import Interceptors from "undici-types/interceptors";

type ActionResult = {
    success: boolean;
    message: string;
};

// LOGIN action
export async function loginAction(formData: z.infer<typeof AuthSchema>): Promise<ActionResult> {

    const validated = AuthSchema.safeParse(formData);

    if (!validated.success) {
        return {success: false, message: "Invalid credentials"};
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Find user by username
    const {data: user, error} = await supabase
        .from("usr_users")
        .select("usr_code, usr_name, usr_user, usr_pwd, usr_role")
        .eq("usr_user", validated.data.user)
        .maybeSingle();

    if (error || !user) {
        return {success: false, message: "Invalid username or password"};
    }

    // Verify password with bcrypt
    const isValid = await bcrypt.compare(validated.data.pwd, user.usr_pwd)
    if (!isValid) {
        return {success: false, message: "Invalid username or password"};
    }

    // Store session in cookie
    cookieStore.set("ink_session", JSON.stringify({
        code: user.usr_code,
        name: user.usr_name,
        user: user.usr_user,
        role: user.usr_role ?? "Employee"
    }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 8,// 8 hours
        path: "/"
    })

    return {success: true, message: "Product created successfully"};

}

// LOGOUT action
export async function logoutAction(){
    const cookieStore = await cookies();
    cookieStore.delete("ink_session")
    redirect("/login")
}