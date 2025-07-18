# Authentication Flow Update

This document describes the updates made to the authentication flow to redirect new users to the solution selector instead of directly to the restaurant dashboard.

## Changes Made

### 1. Updated `AuthUtils` (`/lib/auth/auth-utils.ts`)
- Added `hasExistingOrganizations(userId)` function to check if a user has any active organizations
- Added `getPostAuthRedirectPath(userId)` function to determine the appropriate redirect path based on user's organizations

### 2. Updated Login Form (`/components/login-form.tsx`)
- Modified `handleLogin` to use `AuthUtils.getPostAuthRedirectPath()` instead of hardcoded `/restaurant` redirect
- Now redirects users to `/setup` if they have no organizations, or `/restaurant` if they have organizations

### 3. Updated Sign-up Form (`/components/sign-up-form.tsx`)
- Changed `emailRedirectTo` from `/restaurant` to `/setup` for new user signups
- Updated sign-up success page to mention the solution selector

### 4. Updated Auth Confirmation Route (`/app/auth/confirm/route.ts`)
- Added logic to check user's organizations after email confirmation
- Redirects to `/setup` for new users without organizations
- Redirects to `/restaurant` for existing users with organizations

### 5. Updated Middleware (`/lib/supabase/middleware.ts`)
- Added logic to handle root path (`/`) redirects based on user's organizations
- Redirects authenticated users to appropriate dashboard based on their organizations

### 6. Updated Home Page (`/app/page.tsx`)
- Added authentication check on the home page
- Shows `AuthRedirect` component for authenticated users
- Shows landing page for unauthenticated users

### 7. Created New Components and Hooks
- `AuthRedirect` component (`/components/auth-redirect.tsx`) for handling redirects
- `useAuthRedirect` hook (`/hooks/useAuthRedirect.ts`) for authentication state management

## How It Works

### New User Flow
1. User visits landing page → sees marketing content
2. User clicks "Sign up" → goes to `/auth/sign-up`
3. User fills form and submits → account created with email redirect to `/setup`
4. User clicks email confirmation link → verified and redirected to `/setup`
5. User sees solution selector → can choose restaurant, retail, enterprise, etc.

### Existing User Flow
1. User visits landing page → automatically redirected based on organizations
2. User with organizations → redirected to `/restaurant` (or appropriate dashboard)
3. User without organizations → redirected to `/setup`

### Login Flow
1. User goes to `/auth/login`
2. User logs in → `AuthUtils.getPostAuthRedirectPath()` determines redirect
3. User with organizations → redirected to `/restaurant`
4. User without organizations → redirected to `/setup`

## Key Functions

### `AuthUtils.hasExistingOrganizations(userId)`
```typescript
// Returns true if user has any active organizations
const hasOrgs = await AuthUtils.hasExistingOrganizations(userId);
```

### `AuthUtils.getPostAuthRedirectPath(userId)`
```typescript
// Returns appropriate redirect path based on user's organizations
const path = await AuthUtils.getPostAuthRedirectPath(userId);
// Returns '/setup' for new users, '/restaurant' for existing users
```

## Testing

Run the authentication flow tests:
```bash
npm run test:auth-redirect
```

Or run individual test scenarios:
```bash
npx playwright test tests/auth-redirect.spec.ts
```

## Manual Testing Steps

1. **New User Signup Flow**
   - Go to `/` → should see landing page
   - Click "Start Building Your System" → should go to `/auth/sign-up`
   - Create account → should go to `/auth/sign-up-success`
   - After email verification → should go to `/setup`

2. **Existing User Login Flow**
   - Go to `/auth/login`
   - Login with existing account → should go to `/restaurant` (if has organizations)
   - Login with new account → should go to `/setup` (if no organizations)

3. **Home Page Redirect**
   - Go to `/` while authenticated → should automatically redirect
   - Go to `/` while unauthenticated → should see landing page

## Future Enhancements

1. **Smart Dashboard Routing**: Instead of defaulting to `/restaurant`, route based on organization type
2. **Multi-Organization Support**: Allow users to switch between different organizations
3. **Onboarding Flow**: Guide users through initial setup after choosing solution
4. **Remember User Preferences**: Store user's last active organization and solution

## Database Schema Requirements

The authentication flow depends on the following database tables:
- `user_organizations` - Links users to organizations
- `core_organizations` - Organization details
- `core_users` - User profiles

Make sure these tables exist and have proper RLS policies configured.