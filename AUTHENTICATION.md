# Authentication & Session Management Guide

## Overview

This app uses a custom authentication system with:
- **Custom cookie-based sessions** (not NextAuth)
- **Supabase as database** (for user storage)
- **bcrypt for passwords** (secure hashing)
- **Middleware for route protection** (automatic on all requests)

## Authentication Architecture

### Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    User Actions                          │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
            ┌──────────────────────────┐
            │  1. Visit /login         │
            └──────────────────────────┘
                          │
                          ▼
            ┌──────────────────────────┐
            │ 2. Submit Login Form      │
            │    (username, password)  │
            └──────────────────────────┘
                          │
                          ▼
    ┌─────────────────────────────────────────┐
    │ 3. Server Action: loginAction()         │
    │    - Validate input with Zod           │
    │    - Query Supabase for user           │
    │    - Compare password with bcrypt      │
    └─────────────────────────────────────────┘
                          │
                ┌─────────┴─────────┐
                │                   │
         ✓ Valid         ✗ Invalid
                │                   │
                ▼                   ▼
      Set HTTP-only         Return error
      Cookie with:          message
      - user data
      - role
      - expiry (8h)
                │
                ▼
    ┌──────────────────────────────┐
    │ 4. Redirect to /dashboard    │
    └──────────────────────────────┘
                │
                ▼
    ┌──────────────────────────────┐
    │ 5. middleware.ts runs on     │
    │    EVERY request            │
    │    - Check session cookie   │
    │    - Refresh Supabase token │
    │    - Allow access           │
    └──────────────────────────────┘
                │
                ▼
    ┌──────────────────────────────┐
    │ 6. User sees protected page  │
    └──────────────────────────────┘
```

## When Middleware Runs

### Middleware ALWAYS Runs

- ✓ User visits `/dashboard`
- ✓ User visits `/admin`
- ✓ User visits `/login`
- ✓ API call to `/api/products`
- ✓ Form submission
- ✓ Page refresh

### Middleware NEVER Runs For

- ✗ Static files in `public/`
- ✗ CSS/JS files (`_next/static`)
- ✗ Image optimization (`_next/image`)
- ✗ `favicon.ico`

## Key Components

### 1. LoginForm Component
**File:** `components/auth/LoginForm.tsx`

```typescript
// This is a CLIENT component ("use client")
// Handles user input and form validation

export default function LoginForm() {
    const form = useForm<LoginFormData>({
        resolver: zodResolver(AuthSchema),
    });

    const handleSubmit = async (data) => {
        // Calls server action
        const result = await loginAction(data);
    };
}
```

### 2. loginAction Server Action
**File:** `lib/actions/auth.ts`

```typescript
// This runs ONLY on the server
// Has access to database and cookies

"use server";

export async function loginAction(formData) {
    // 1. Validate input
    const validated = AuthSchema.safeParse(formData);
    
    // 2. Query database
    const {data: user} = await supabase
        .from("usr_users")
        .select(...)
        .eq("usr_user", validated.data.user);
    
    // 3. Hash password check
    const isValid = await bcrypt.compare(
        validated.data.pwd,
        user.usr_pwd
    );
    
    // 4. Set cookie
    cookieStore.set("ink_session", JSON.stringify({...}), {
        httpOnly: true,
        secure: true,
        maxAge: 60 * 60 * 8,
    });
    
    return {success: true, message: "Login successful"};
}
```

### 3. Middleware
**File:** `middleware.ts`

```typescript
// Runs on EVERY request BEFORE route handler

export async function middleware(request: NextRequest) {
    // Check for session cookie
    const isAuthenticated = !!request.cookies.get('ink_session');
    
    // Protect routes
    if (protectedRoutes.some(...)) {
        if (!isAuthenticated) {
            return NextResponse.redirect('/login');
        }
    }
    
    // Refresh Supabase session
    return await createClient(request);
}
```

### 4. getSession Function
**File:** `lib/session/session.server.ts`

```typescript
// Use in Server Components and Server Actions
// CANNOT be used in client components

"use server";

export async function getSession(): Promise<AuthUser | null> {
    const cookieStore = await cookies();
    const raw = cookieStore.get("ink_session")?.value;
    
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
}
```

## Data Flow: Login Process

```
┌──────────────────────────────────────────────┐
│ 1. USER SUBMITS LOGIN FORM                   │
│                                              │
│ Input:                                       │
│ - username: "john.doe"                       │
│ - password: "MyP@ssw0rd"                    │
└──────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────┐
│ 2. VALIDATION (Client-Side + Server-Side)    │
│                                              │
│ Client:                                      │
│ - React Hook Form validates format           │
│                                              │
│ Server:                                      │
│ - Zod validates: user.min(1), pwd.min(6)   │
└──────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────┐
│ 3. DATABASE QUERY                            │
│                                              │
│ SELECT * FROM usr_users                      │
│ WHERE usr_user = 'john.doe'                  │
│                                              │
│ Result:                                      │
│ - usr_code: uuid                             │
│ - usr_name: "John Doe"                       │
│ - usr_pwd: "$2b$10$hashedbcrypt..." (hash)  │
│ - usr_role: "Administrator"                  │
└──────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────┐
│ 4. PASSWORD VERIFICATION                     │
│                                              │
│ bcrypt.compare(                              │
│   "MyP@ssw0rd",  (plain text)                │
│   "$2b$10$hashedbcrypt..."  (stored hash)   │
│ )                                            │
│                                              │
│ Result: true ✓                               │
└──────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────┐
│ 5. CREATE SESSION COOKIE                     │
│                                              │
│ Cookie Name: ink_session                     │
│ Cookie Value: {                              │
│   "code": uuid,                              │
│   "name": "John Doe",                        │
│   "user": "john.doe",                        │
│   "role": "Administrator"                    │
│ }                                            │
│                                              │
│ Cookie Options:                              │
│ - httpOnly: true  (can't access from JS)    │
│ - secure: true    (HTTPS only)              │
│ - maxAge: 28800   (8 hours)                 │
│ - sameSite: "lax" (CSRF protection)         │
└──────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────┐
│ 6. REDIRECT TO DASHBOARD                     │
│                                              │
│ 302 Redirect to /dashboard                   │
│ With Set-Cookie header                       │
└──────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────┐
│ 7. MIDDLEWARE INTERCEPTS REQUEST TO /        │
│                                              │
│ - Check: ink_session cookie exists ✓         │
│ - Refresh: Supabase session tokens          │
│ - Allow: Request to proceed                  │
└──────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────┐
│ 8. DASHBOARD LAYOUT LOADS                    │
│                                              │
│ const user = await getSession()              │
│ → Returns: {                                 │
│     "code": uuid,                            │
│     "name": "John Doe",                      │
│     "user": "john.doe",                      │
│     "role": "Administrator"                  │
│   }                                          │
└──────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────┐
│ 9. DASHBOARD RENDERS                         │
│                                              │
│ - Pass user info to Sidebar                  │
│ - Display role-based navigation              │
│ - Show user name in Topbar                   │
└──────────────────────────────────────────────┘
```

## Security Model

### What's Protected

| What | How | Where |
|------|-----|-------|
| Passwords | bcrypt hashing | `loginAction()` |
| Session token | HTTP-only cookie | Browser/Server only |
| CSRF attacks | sameSite: 'lax' | Cookie config |
| Unauthorized access | Middleware check | Every request |
| Token refresh | Supabase auto-refresh | Middleware |

### Cookie Security

```typescript
// In lib/actions/auth.ts
cookieStore.set("ink_session", sessionData, {
    httpOnly: true,      // Can't access from JavaScript
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: "lax",     // CSRF protection
    maxAge: 60 * 60 * 8, // Expires in 8 hours
    path: "/"            // Available everywhere
});
```

### Why Each Option Matters

- **httpOnly:** Prevents XSS attacks from stealing session cookie
- **secure:** Ensures cookie only sent over HTTPS (not HTTP)
- **sameSite:** Prevents CSRF by restricting cross-site cookie access
- **maxAge:** Session auto-expires after 8 hours

## Using getSession in Components

### In Server Components (✓ OK)

```typescript
// app/dashboard/page.tsx
import { getSession } from "@/lib/session/session.server";

export default async function DashboardPage() {
    const user = await getSession();
    
    if (!user) {
        redirect("/login");
    }
    
    return <div>Welcome, {user.name}</div>;
}
```

### In Client Components (✗ NOT OK)

```typescript
// components/Profile.tsx
"use client";

import { getSession } from "@/lib/session/session.server";

export default function Profile() {
    // ✗ ERROR: "getSession" requires "use server"
    const user = await getSession(); // CAN'T DO THIS!
    
    return <div>{user.name}</div>;
}
```

### Solution: Pass from Server to Client

```typescript
// app/dashboard/page.tsx (Server Component)
export default async function Dashboard() {
    const user = await getSession();
    
    return <ProfileWidget user={user} />; // Pass as prop
}

// components/ProfileWidget.tsx (Client Component)
"use client";

export default function ProfileWidget({ user }) {
    return <div>{user.name}</div>; // Use prop
}
```

## Session Expiration

### Current Settings
- **Duration:** 8 hours (28,800 seconds)
- **Reset:** Whenever user logs in
- **Auto-cleanup:** Browser will delete after expiration

### To Change Duration

```typescript
// In lib/actions/auth.ts
cookieStore.set("ink_session", ..., {
    maxAge: 60 * 60 * 24, // 24 hours
    // Or:
    maxAge: 60 * 60 * 2,  // 2 hours
    // Or:
    maxAge: 60 * 30,      // 30 minutes
});
```

## Logout Process

```typescript
// lib/actions/auth.ts
export async function logoutAction() {
    const cookieStore = await cookies();
    cookieStore.delete("ink_session");
    redirect("/login");
}
```

### What Happens

1. Server deletes `ink_session` cookie
2. Browser removes the cookie
3. User is redirected to `/login`
4. Next request has no session cookie
5. Middleware redirects to login (no authenticated session)

## Testing Authentication

### Test Login
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"user":"john.doe","pwd":"MyP@ssw0rd"}'
```

### Test Protected Route (Without Auth)
```bash
curl http://localhost:3000/dashboard
# Should redirect to /login
```

### Test Protected Route (With Auth)
```bash
curl -b "ink_session={...}" http://localhost:3000/dashboard
# Should show dashboard
```

### Check Cookie in Browser
1. Open DevTools (F12)
2. Go to Application tab
3. Look for `ink_session` in Cookies
4. Verify it's marked as HttpOnly

## Troubleshooting

### Issue: Login shows "Invalid username or password"

**Likely causes:**
1. Username doesn't exist in database
2. Password is incorrect
3. User record is missing from `usr_users` table

**Solution:**
1. Verify user exists: `SELECT * FROM usr_users WHERE usr_user = '...'`
2. Test password with bcrypt tool
3. Create new test user if needed

### Issue: Can't access /dashboard even after login

**Likely causes:**
1. Cookie wasn't set properly
2. Cookie expired
3. Middleware configuration wrong

**Solution:**
1. Check browser cookies (DevTools)
2. Verify cookie has `ink_session` name
3. Login again
4. Check middleware.ts routes configuration

### Issue: Sudden logout after a few minutes

**Cause:** Session expires too quickly

**Solution:**
- Increase `maxAge` in `loginAction()`
- Current: 8 hours, try 24 hours

## Differences from NextAuth

This custom implementation:
- ✓ Simpler for basic auth
- ✓ Full control over session data
- ✓ No external dependencies
- ✓ Easy to debug
- ✗ No built-in social login
- ✗ Manual token refresh (done in middleware)
- ✗ No automatic session database

Use NextAuth if you need:
- Social login (Google, GitHub, etc.)
- Automatic token management
- Multiple authentication strategies
- Enterprise auth options

## Next Steps

1. Test login process end-to-end
2. Verify middleware blocks unauthenticated access
3. Test logout and re-login
4. Check session expiration after 8 hours
5. Monitor browser cookies during testing
