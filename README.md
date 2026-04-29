# INK Design Management System

A modern Next.js 16 application for managing design projects, products, and team collaboration with role-based access control.

## Tech Stack

- **Framework:** Next.js 16.2.4
- **React:** 19.2.4
- **Database:** Supabase PostgreSQL
- **Authentication:** Custom cookie-based sessions with bcrypt
- **Form Validation:** React Hook Form + Zod
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui + Radix UI

## Prerequisites

- Node.js 20+
- npm or pnpm
- Supabase account and project
- Git

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd inkdesignback
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Setup environment variables:**
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase credentials:
     ```bash
     NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
     NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
     ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   - Navigate to `http://localhost:3000`
   - Login with your credentials or create a new account

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── dashboard/         # Protected dashboard routes
│   ├── login/            # Authentication pages
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/            # Reusable React components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   ├── products/         # Product management components
│   └── ui/               # Base UI components
├── lib/                   # Shared utilities
│   ├── actions/          # Server actions
│   ├── session/          # Session management
│   ├── validations/      # Zod schemas
│   └── utils.ts          # Helper functions
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
│   └── supabase/         # Supabase client setup
├── middleware.ts          # Next.js middleware for route protection
├── next.config.js        # Next.js configuration
└── tsconfig.json         # TypeScript configuration
```

## Database Schema

### Users Table (`usr_users`)
- `usr_code` (UUID) - Primary key
- `usr_name` (TEXT) - Full name
- `usr_user` (TEXT) - Username (unique)
- `usr_pwd` (TEXT) - Hashed password (bcrypt)
- `usr_role` (TEXT) - Role ('Administrator' or 'Employee')
- `created_at` (TIMESTAMP) - Creation date

### Products Table (`prd_products`)
- `prd_code` (UUID) - Primary key
- `prd_name` (TEXT) - Product name
- `prd_description` (TEXT) - Description
- `prd_price` (DECIMAL) - Price
- `created_at` (TIMESTAMP) - Creation date
- `updated_at` (TIMESTAMP) - Last update

## Authentication Flow

1. User submits login form with username and password
2. Server action (`loginAction`) validates credentials
3. Password is verified using bcrypt
4. Session cookie is created (HTTP-only, 8 hours expiration)
5. User is redirected to dashboard

### Protected Routes

Routes requiring authentication:
- `/dashboard` - Main dashboard
- `/admin` - Admin panel (Admin role only)

### Middleware

The `middleware.ts` file:
- Intercepts all requests
- Checks for valid session cookie
- Redirects unauthenticated users to `/login`
- Redirects authenticated users away from `/login`
- Manages Supabase session refresh

## Security Features

- HTTP-only cookies for session storage
- Bcrypt password hashing (salt rounds: 10)
- CSRF protection with `sameSite: 'lax'`
- Role-based access control (RBAC)
- Server-side session validation
- Secure password validation

## Available Scripts

```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint
```

## Environment Variables

### Required
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` - Supabase publishable key

### Optional
- `NODE_ENV` - Set to 'production' for production builds

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy with one click

### Other Platforms

Ensure Node.js 20+ is available and set the build command to `npm run build`.

## Common Issues

### "Unauthenticated" error
- Check if `ink_session` cookie exists in browser DevTools
- Verify Supabase credentials in `.env.local`
- Clear cookies and login again

### Database connection errors
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check Supabase project status
- Ensure tables exist in database

### Session expires too quickly
- Session timeout is set to 8 hours in `lib/actions/auth.ts`
- Adjust `maxAge` value if needed (in milliseconds)

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Commit: `git commit -m 'Add feature'`
4. Push: `git push origin feature/your-feature`
5. Open a pull request

## License

MIT License - See LICENSE file for details

## Support

For issues or questions:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Include error messages and steps to reproduce
