# 🐛 Production Debug Guide

## Issue Status
- **Problem**: `/setup/restaurant` returns 307 redirect to `/auth/login` in production
- **Local**: Works perfectly on `http://localhost:3000/setup/restaurant`
- **Production**: Fails on `https://heraerp.vercel.app/setup/restaurant`

## Root Cause Found
**Environment variables are not set up in Vercel production environment**

## Required Environment Variables

You need to set these in your Vercel dashboard:

### 1. Go to Vercel Dashboard
1. Visit [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (hera-universal)
3. Go to Settings → Environment Variables

### 2. Add Required Variables

```bash
# Required Supabase Environment Variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_SERVICE_KEY=your_supabase_service_role_key

# Optional AI Keys (if using AI features)
CLAUDE_API_KEY=your_claude_api_key
OPENAI_API_KEY=your_openai_api_key
```

### 3. How to Get Supabase Values

1. **Go to your Supabase project dashboard**
2. **Settings → API**
3. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon/Public Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service Role Key** → `NEXT_PUBLIC_SUPABASE_SERVICE_KEY` (keep this secret!)

### 4. Example Values Format

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Why This Fixes the Issue

Without environment variables:
- `hasEnvVars` returns `false`
- Middleware skips authentication checks
- BUT the setup page itself tries to connect to Supabase
- Supabase client fails to initialize
- Page fails to load properly
- Results in redirect behavior

With environment variables:
- ✅ Supabase client initializes correctly
- ✅ Setup page loads and functions
- ✅ Restaurant setup works end-to-end
- ✅ Organization access control functions

## Quick Test After Setting Env Vars

Once you've added the environment variables:

1. **Trigger a new deployment**:
   ```bash
   git commit --allow-empty -m "trigger deployment with env vars"
   git push origin main
   ```

2. **Test the route**:
   ```bash
   curl -I https://heraerp.vercel.app/setup/restaurant
   ```

3. **Expected result**: Should return `200 OK` instead of `307 redirect`

4. **Test in browser**: Navigate to `https://heraerp.vercel.app/setup/restaurant`

## Alternative Quick Fix (Temporary)

If you want to test without setting up Supabase immediately, you can temporarily disable the env var check:

```typescript
// In lib/utils.ts, temporarily comment out the check:
export const hasEnvVars = true; // Always return true for testing
// process.env.NEXT_PUBLIC_SUPABASE_URL &&
// process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
```

**Note**: This is only for testing. You'll need proper env vars for the app to function.

## Verification Checklist

After setting environment variables:

- [ ] Environment variables added in Vercel dashboard
- [ ] New deployment triggered
- [ ] `/setup/restaurant` returns 200 OK
- [ ] Setup page loads in browser
- [ ] Restaurant setup flow works
- [ ] Organization access control functions
- [ ] New restaurant pages accessible

## Next Steps

1. **Set environment variables in Vercel**
2. **Trigger new deployment**
3. **Test setup route accessibility**
4. **Complete restaurant setup flow**
5. **Verify organization access control**

This should resolve the production routing issue completely.