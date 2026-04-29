import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {

    return (
        <div className="min-h-screen bg-gray-50 flex">

            {/* Left panel — branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-black flex-col justify-between p-12">
                <div className="flex items-center gap-3">
                    {/* Logo placeholder — replace src with your actual logo */}
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                        <span className="text-black font-bold text-lg">I</span>
                    </div>
                    <span className="text-white font-semibold text-lg tracking-tight">
            INK Management
          </span>
                </div>

                <div>
                    <h1 className="text-white text-4xl font-bold leading-tight mb-4">
                        Manage your<br/>
                        business with<br/>
                        confidence.
                    </h1>
                    <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                        Orders, products, customers and inventory — everything in one place.
                    </p>
                </div>

                <p className="text-gray-600 text-xs">
                    © {new Date().getFullYear()} INK. All rights reserved.
                </p>
            </div>

            {/* Right panel — login form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-sm">

                    {/* Mobile logo */}
                    <div className="flex items-center gap-2 mb-10 lg:hidden">
                        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">I</span>
                        </div>
                        <span className="font-semibold text-gray-900">INK Management</span>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        Welcome back
                    </h2>
                    <p className="text-sm text-gray-500 mb-8">
                        Sign in to your account to continue
                    </p>

                    <LoginForm/>

                </div>
            </div>
        </div>

    )

}