"use client";

import {useRouter} from "next/navigation";
import {useState} from "react";
import {useForm} from "react-hook-form";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import {AuthFormData, AuthSchema} from "@/lib/validations/auth";
import {zodResolver} from "@hookform/resolvers/zod";
import {loginAction} from "@/lib/actions/auth";

export default function LoginForm(){

    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [serverError, setserverError] = useState("");

    const{
        register,
        handleSubmit,
        formState: {errors, isSubmitting}
    } = useForm<AuthFormData>({resolver: zodResolver(AuthSchema)})

    async function onSubmit(data: AuthFormData){
        setserverError("");
        const result = await loginAction(data);
        if(result.success){
            router.push("/dashboard");
            router.refresh();
        }else{
            setserverError(result.message);
        }
    }

    return(
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            {/* Server error message */}
            {serverError && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    <p className="text-red-600 text-sm">{serverError}</p>
                </div>
            )}

            {/* Username */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Username
                </label>
                <input
                    {...register("user")}
                    type="text"
                    placeholder="your.username"
                    autoComplete="username"
                    className={`w-full px-4 py-3 text-sm rounded-xl border outline-none transition-all
            ${errors.user
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 bg-white focus:border-black focus:ring-2 focus:ring-black/10"
                    }`}
                />
                {errors.user && (
                    <p className="text-xs text-red-500">{errors.user.message}</p>
                )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Password
                </label>
                <div className="relative">
                    <input
                        {...register("pwd")}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className={`w-full px-4 py-3 pr-11 text-sm rounded-xl border outline-none transition-all
              ${errors.pwd
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200 bg-white focus:border-black focus:ring-2 focus:ring-black/10"
                        }`}
                    />
                    {/* Show/hide password toggle */}
                    <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
                {errors.pwd && (
                    <p className="text-xs text-red-500">{errors.pwd.message}</p>
                )}
            </div>

            {/* Submit button */}
            <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 w-full bg-black hover:bg-gray-900 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60 mt-2"
            >
                {isSubmitting ? (
                    <Loader2 size={16} className="animate-spin" />
                ) : (
                    <LogIn size={16} />
                )}
                {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
        </form>
    )


}