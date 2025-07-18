# 🔧 Vercel Monorepo Configuration Fix

## Problem
Vercel is not detecting changes in the `frontend/` subdirectory because it's treating this as a monorepo but not configured correctly.

## Solution: Update Vercel Project Settings

### Step 1: Update Root Directory in Vercel Dashboard

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project** (hera-erp or hera-universal)
3. **Go to Settings → General**
4. **Find "Root Directory" section**
5. **Set Root Directory to**: `frontend`
6. **Click "Save"**

### Step 2: Update Build Settings

While in Settings:
1. **Go to "Build & Output Settings"**
2. **Set Build Command**: `npm run build`
3. **Set Output Directory**: `.next`
4. **Set Install Command**: `npm ci`
5. **Click "Save"**

### Step 3: Force Redeploy

After updating settings:
```bash
git commit --allow-empty -m "trigger redeploy with correct monorepo config"
git push origin main
```

## Alternative: Delete and Recreate Project

If the above doesn't work, you may need to:

1. **Delete the Vercel project** (not the GitHub repo)
2. **Import again from GitHub**
3. **During import, set Root Directory to `frontend`**
4. **Set environment variables again**

## Root Cause

Vercel was trying to build from the repository root (`/`) instead of the frontend directory (`/frontend`), so:
- ❌ It couldn't find `package.json` in the right place
- ❌ Changes to `frontend/` files weren't triggering rebuilds
- ❌ The build process was failing silently

## Verification

After fixing, verify:
1. ✅ Deployments trigger on `frontend/` file changes
2. ✅ `/setup/restaurant` loads correctly
3. ✅ Environment variables work
4. ✅ New pages appear immediately after push

## Quick Test

```bash
# Make a small change to test deployment
echo "/* Test change */" >> frontend/app/globals.css
git add . && git commit -m "test: verify deployment detection"
git push origin main
```

Check if Vercel deployment starts immediately.