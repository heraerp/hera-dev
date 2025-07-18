# 🚀 Vercel Deployment Fix Guide

## Issue Identified

Vercel was not updating with new pages because the project has a **monorepo structure** where the Next.js app is located in the `frontend/` subdirectory, but Vercel was configured to deploy from the root directory.

## ✅ Solution Implemented

### 1. Root-Level Vercel Configuration

Created `/vercel.json` at the root level with proper monorepo configuration:

```json
{
  "rootDirectory": "frontend",
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/.next",
  "installCommand": "cd frontend && npm ci",
  "devCommand": "cd frontend && npm run dev"
}
```

### 2. Key Configuration Changes

#### **Root Directory**
- `"rootDirectory": "frontend"` - Tells Vercel the app is in the frontend folder
- All build commands prefixed with `cd frontend &&`

#### **Build Commands**
- `"buildCommand": "cd frontend && npm run build"` - Build from frontend directory
- `"installCommand": "cd frontend && npm ci"` - Install dependencies in frontend
- `"outputDirectory": "frontend/.next"` - Next.js build output location

#### **API Functions**
- `"frontend/app/api/**/*.ts"` - Correct path for API routes in monorepo

## 🔧 Vercel Dashboard Configuration

If the automatic detection doesn't work, manually configure in Vercel dashboard:

### Project Settings
1. Go to Vercel Dashboard → Your Project → Settings
2. **Build & Development Settings**:
   - Framework Preset: `Next.js`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm ci`

### Environment Variables
Ensure these are set in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CLAUDE_API_KEY`
- `OPENAI_API_KEY`

## 🚨 Common Monorepo Issues

### Issue 1: Build Fails with "Package.json not found"
**Solution**: Ensure `rootDirectory` is set to `frontend`

### Issue 2: API Routes Not Found
**Solution**: Update functions path to `frontend/app/api/**/*.ts`

### Issue 3: Environment Variables Not Loading
**Solution**: Verify environment variables are set in Vercel dashboard

### Issue 4: Static Files Not Found
**Solution**: Ensure `outputDirectory` points to `frontend/.next`

## 📋 Deployment Checklist

Before deploying, verify:

- [ ] Root-level `vercel.json` exists with `rootDirectory: "frontend"`
- [ ] Build succeeds locally: `cd frontend && npm run build`
- [ ] Environment variables configured in Vercel dashboard
- [ ] Latest code pushed to GitHub: `git push origin main`
- [ ] GitHub integration enabled in Vercel
- [ ] Automatic deployments enabled

## 🔍 Troubleshooting Commands

### Local Build Test
```bash
cd frontend
npm ci
npm run build
npm start
```

### Check Vercel Deployment Logs
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on failed deployment
3. Check "Build Logs" and "Function Logs"

### Force Redeploy
```bash
# Trigger deployment with empty commit
git commit --allow-empty -m "trigger deployment"
git push origin main
```

## 🎯 Expected Results

After applying this fix:

✅ **Vercel will properly deploy from the frontend directory**
✅ **New pages will appear in the deployed application**
✅ **API routes will function correctly**
✅ **Static assets will load properly**
✅ **Environment variables will be available**

## 🔄 Alternative Solutions

### Option 1: Move Next.js to Root
```bash
# Move everything from frontend/ to root
mv frontend/* .
mv frontend/.* . 2>/dev/null || true
rmdir frontend
```

### Option 2: Use Vercel CLI
```bash
npm i -g vercel
cd frontend
vercel --prod
```

### Option 3: Separate Repository
Create a separate repository for just the frontend code and deploy that to Vercel.

## 📊 Verification Steps

1. **Check Deployment Status**: Vercel dashboard shows successful deployment
2. **Test New Pages**: Navigate to new restaurant pages
3. **Verify Organization Access**: Test OrganizationGuard functionality
4. **Check API Routes**: Ensure all API endpoints work
5. **Test Environment Variables**: Verify Supabase connection

---

This fix resolves the monorepo deployment issue and ensures all new pages and features are properly deployed to Vercel.