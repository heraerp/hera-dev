/**
 * HERA Universal - Menu Image Upload API
 * 
 * Next.js 15 App Router API Route Handler
 * Handles image upload for menu items using Supabase Storage
 * 
 * Supports file upload with validation and cloud storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Admin client for file uploads
const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
};

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed image types
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Supabase Storage bucket name
const STORAGE_BUCKET = 'menu-images';

// Generate unique filename with organization prefix
function generateFilename(originalName: string, organizationId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  // Include organization ID for better organization in storage
  return `${organizationId}/menu-${timestamp}-${random}.${extension}`;
}

// Validate image data
function validateImageData(mimeType: string, size: number) {
  if (!ALLOWED_TYPES.includes(mimeType)) {
    throw new Error(`Invalid file type. Allowed types: ${ALLOWED_TYPES.join(', ')}`);
  }
  
  if (size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }
}

// POST /api/menu/upload-image
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Validate file
    validateImageData(file.type, file.size);

    // Generate unique filename
    const filename = generateFilename(file.name, organizationId);

    // Convert file to buffer for Supabase Storage
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false // Don't overwrite existing files
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filename);

    const imageUrl = urlData.publicUrl;

    console.log(`✅ Image uploaded to Supabase: ${filename} (${(file.size / 1024).toFixed(1)}KB)`);

    return NextResponse.json({
      success: true,
      data: {
        imageUrl: imageUrl,
        imageName: filename,
        originalName: file.name,
        size: file.size,
        type: file.type,
        message: 'Image uploaded successfully to cloud storage'
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Image upload error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

// DELETE /api/menu/upload-image
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
    const organizationId = searchParams.get('organizationId');

    if (!filename || !organizationId) {
      return NextResponse.json(
        { error: 'filename and organizationId are required' },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

    // Delete from Supabase Storage
    const { error: deleteError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filename]);

    if (deleteError) {
      console.error('Supabase deletion error:', deleteError);
      // Don't throw error if file doesn't exist - it might have been deleted already
      if (deleteError.message !== 'The resource was not found') {
        throw new Error(`Deletion failed: ${deleteError.message}`);
      }
    }

    console.log(`✅ Image deleted from Supabase Storage: ${filename}`);

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully from cloud storage'
    });

  } catch (error) {
    console.error('Image deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete image from cloud storage' },
      { status: 500 }
    );
  }
}