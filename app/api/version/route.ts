/**
 * HERA Universal - Version Management API
 * 
 * Provides version information for PWA update checks
 * Uses package.json version + build timestamp for accurate versioning
 */

import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import path from 'path';

// Generate build timestamp at build time
const BUILD_TIMESTAMP = Date.now();

// Read version from package.json
function getPackageVersion(): string {
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    return packageJson.version || '1.0.0';
  } catch (error) {
    console.warn('Could not read package.json version, using default');
    return '1.0.0';
  }
}

// Generate version hash based on deployment
function generateVersionHash(): string {
  // Use Vercel deployment URL or build timestamp
  const deploymentId = process.env.VERCEL_GIT_COMMIT_SHA || 
                      process.env.VERCEL_DEPLOYMENT_ID || 
                      BUILD_TIMESTAMP.toString();
  
  return deploymentId.slice(0, 8); // Short hash
}

// GET /api/version
export async function GET(request: NextRequest) {
  try {
    const packageVersion = getPackageVersion();
    const versionHash = generateVersionHash();
    const fullVersion = `${packageVersion}-${versionHash}`;
    
    const versionInfo = {
      version: fullVersion,
      packageVersion,
      buildHash: versionHash,
      buildTimestamp: BUILD_TIMESTAMP,
      environment: process.env.NODE_ENV,
      deploymentUrl: process.env.VERCEL_URL || 'localhost',
      gitCommit: process.env.VERCEL_GIT_COMMIT_SHA,
      gitBranch: process.env.VERCEL_GIT_COMMIT_REF,
      buildTime: new Date(BUILD_TIMESTAMP).toISOString()
    };

    // Add cache headers to prevent caching of version endpoint
    const response = NextResponse.json({
      success: true,
      data: versionInfo
    });

    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;

  } catch (error) {
    console.error('Version API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to get version information',
      data: {
        version: '1.0.0-unknown',
        packageVersion: '1.0.0',
        buildHash: 'unknown',
        buildTimestamp: BUILD_TIMESTAMP,
        environment: process.env.NODE_ENV || 'development'
      }
    }, { status: 500 });
  }
}

// HEAD request for quick version checks
export async function HEAD(request: NextRequest) {
  const packageVersion = getPackageVersion();
  const versionHash = generateVersionHash();
  const fullVersion = `${packageVersion}-${versionHash}`;
  
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('X-App-Version', fullVersion);
  response.headers.set('X-Build-Hash', versionHash);
  response.headers.set('X-Build-Timestamp', BUILD_TIMESTAMP.toString());
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  
  return response;
}