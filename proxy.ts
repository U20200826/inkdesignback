// Route protection proxy — checks session cookie and role permissions
import { type NextRequest, NextResponse } from "next/server";

// Public routes — no authentication required
const PUBLIC_ROUTES = ["/login"];

// Routes that require Administrator role
const ADMIN_ONLY_ROUTES = ["/dashboard/users", "/dashboard/settings"];

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public routes
    if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
        return NextResponse.next();
    }

    // Allow static files and Next.js internals
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api") ||
        pathname.includes(".")
    ) {
        return NextResponse.next();
    }

    // Read session cookie
    const sessionRaw = request.cookies.get("ink_session")?.value;

    // No session → redirect to login
    if (!sessionRaw) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
        const session = JSON.parse(sessionRaw);

        // Already logged in and going to login → redirect to dashboard
        if (pathname === "/login") {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }

        // Admin-only route check
        if (ADMIN_ONLY_ROUTES.some((r) => pathname.startsWith(r))) {
            if (session.role !== "Administrator") {
                return NextResponse.redirect(
                    new URL("/dashboard/unauthorized", request.url)
                );
            }
        }

        return NextResponse.next();

    } catch {
        // Corrupt cookie — clear and redirect to login
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete("ink_session");
        return response;
    }
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};