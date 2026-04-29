# Middleware Documentation

## Overview

The `middleware.ts` file is a Next.js 16 middleware that runs on every request before it reaches your routes. It handles authentication, route protection, and Supabase session management.

## How It Works

### 1. Request Lifecycle

```
Browser Request
    ↓
middleware.ts (runs first)
    ├── Check session cookie
    ├── Handle Supabase refresh
    ├── Protect routes
    ├── Redirect if needed
    ↓
Route Handler / Page Component
```

### 2. Key Functions

#### Authentication Check
```typescript
const sessionCookie = request.cookies.get('ink_session');
const isAuthenticated = !!sessionCookie?.value;
```
- Checks if user has valid `ink_session` cookie
- Returns true if cookie exists, false otherwise

#### Route Protection
```typescript
if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated) {
        // Redirect to login
    }
}
```
- Prevents unauthenticated users from accessing `/dashboard` or `/admin`
- Automatically redirects to login page

#### Session Refresh
```typescript
const supabaseResponse = await createClient(request);
```
- Automatically refreshes Supabase session
- Handles cookie rotation
- Prevents session expiration during active use

#### Smart Redirects
```typescript
if (publicRoutes.includes(pathname) && isAuthenticated) {
    // Redirect authenticated users away from login page
}
```
- Prevents already-logged-in users from seeing login form
- Better user experience

## Configuration

### Protected Routes

Edit the `protectedRoutes` array to add more protected routes:

```typescript
const protectedRoutes = [
    '/dashboard',
    '/admin',
    '/settings',  // Add new protected route
];
```

### Public Routes

Routes that redirect authenticated users away:

```typescript
const publicRoutes = [
    '/login',
    '/',
];
```

### Route Matching

The matcher pattern excludes static files:

```typescript
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
```

This ensures:
- Middleware doesn't run for static assets (faster)
- Only runs for actual routes and API endpoints
- Images and CSS are excluded

## When Middleware Runs

Middleware runs for EVERY request to:
- Pages (`/dashboard`, `/login`, etc.)
- API routes (`/api/products`, etc.)
- Static files not in exclusions

Middleware does NOT run for:
- `_next/static` (compiled Next.js files)
- `_next/image` (image optimization)
- `favicon.ico`
- Files in `public` folder

## Security Benefits

1. **Early Authentication Check**
   - Validates session before route handler runs
   - Prevents unauthorized access to protected routes

2. **Session Refresh**
   - Automatically renews Supabase tokens
   - Prevents session expiration during active use

3. **CSRF Protection**
   - Cookies are HTTP-only (set in auth.ts)
   - Cannot be accessed from JavaScript
   - Protected by sameSite attribute

4. **Centralized Control**
   - All route protection in one place
   - Easy to add/remove protected routes
   - Consistent behavior across app

## Supabase Middleware Function

The `createClient(request)` function in `utils/supabase/middleware.ts`:

```typescript
export const createClient = (request: NextRequest) => {
    // Create response to return
    let supabaseResponse = NextResponse.next({
        request: { headers: request.headers }
    });

    // Initialize Supabase client
    const supabase = createServerClient(
        supabaseUrl!,
        supabaseKey!,
        {
            cookies: {
                // Read cookies from request
                getAll() {
                    return request.cookies.getAll();
                },
                // Set cookies in response
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({name, value, options}) => {
                        request.cookies.set(name, value);
                        supabaseResponse.cookies.set(name, value, options);
                    });
                }
            }
        }
    );

    return supabaseResponse;
};
```

### What It Does

1. Creates a response object with original request headers
2. Initializes Supabase client with cookie handling
3. Automatically refreshes auth tokens if needed
4. Sets refreshed cookies in the response
5. Returns updated response with new cookies

### Why It's Needed

- Supabase stores session tokens in cookies
- Tokens can expire during long user sessions
- Middleware refreshes tokens before they expire
- Prevents sudden logouts during use

## Examples

### Adding a New Protected Route

```typescript
const protectedRoutes = [
    '/dashboard',
    '/admin',
    '/reports',  // Add this
];
```

Now `/reports` and `/reports/*` require authentication.

### Adding a Public Route That Stays Public

If you want `/blog` to be public and NOT redirect authenticated users:

```typescript
// Don't add it to publicRoutes
// This way authenticated users can still access it
```

### Creating a Semi-Protected Route

For routes that work both authenticated and unauthenticated:

```typescript
// Option 1: Don't add to either array
// Middleware allows access, but route handler can check auth

// Option 2: Check in route handler
export default async function MyPage() {
    const user = await getSession();
    
    if (user) {
        return <AuthenticatedView user={user} />;
    }
    
    return <PublicView />;
}
```

## Troubleshooting

### Issue: "Infinite redirect loop"

**Cause:** Route in `protectedRoutes` but user can't get session cookie

**Solution:**
```typescript
// Check that login page is NOT in protectedRoutes
const protectedRoutes = ['/dashboard', '/admin']; // ✓ Correct
const protectedRoutes = ['/login', '/dashboard']; // ✗ Wrong!
```

### Issue: "Can't access protected route even when logged in"

**Cause:** Session cookie missing or corrupt

**Solution:**
1. Check browser DevTools → Application → Cookies
2. Verify `ink_session` cookie exists
3. Clear cookies and login again

### Issue: "API routes return 401"

**Cause:** Middleware doesn't automatically add auth to API responses

**Solution:** API routes must check auth independently:
```typescript
// app/api/products/route.ts
import { getSession } from '@/lib/session/session.server';

export async function GET() {
    const user = await getSession();
    
    if (!user) {
        return Response.json({error: 'Unauthorized'}, {status: 401});
    }
    
    // Handle request...
}
```

## Performance Considerations

- Middleware runs on EVERY request (even for CSS, JS)
- Keep middleware logic fast and simple
- Use matcher pattern to exclude unnecessary files
- Supabase refresh is lightweight (checks token expiry first)

## Testing Middleware

### Test Route Protection

```bash
# Without auth cookie - should redirect to /login
curl http://localhost:3000/dashboard

# With auth cookie - should work
curl -b "ink_session={...}" http://localhost:3000/dashboard
```

### Test Public Route Redirect

```bash
# With auth cookie - should redirect to /dashboard
curl -b "ink_session={...}" http://localhost:3000/login
```

## Migration Notes

If you had middleware elsewhere:
- Move all middleware logic to `middleware.ts`
- Update route matchers as needed
- Test all protected routes
- Clear browser cookies for testing

## Next Steps

1. Test middleware with your routes
2. Add any additional protected routes needed
3. Monitor for unexpected redirects
4. Update matcher pattern if needed
