const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateFallbackImage() {
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
    <rect width="400" height="300" fill="#1F2937"/>
    <g transform="translate(200,150)">
      <rect x="-40" y="-40" width="80" height="80" rx="8" fill="#374151" stroke="#4B5563" stroke-width="2"/>
      <path d="M-20,-20 L20,-20 L20,0 L0,0 L0,20 L-20,20 Z" fill="#6B7280"/>
      <circle cx="10" cy="-10" r="6" fill="#9CA3AF"/>
      <path d="M-15,10 L15,10" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round"/>
    </g>
    <text x="200" y="220" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="#9CA3AF" text-anchor="middle">Image not available</text>
  </svg>`;

  const outputPath = path.join(__dirname, '../public/static/images/fallback.png');
  
  try {
    await sharp(Buffer.from(svgContent))
      .png()
      .toFile(outputPath);
    
    console.log('✅ Fallback image generated successfully');
  } catch (error) {
    console.error('❌ Error generating fallback image:', error);
    // If sharp fails, create a simple placeholder
    const { createCanvas } = require('canvas');
    const canvas = createCanvas(400, 300);
    const ctx = canvas.getContext('2d');
    
    // Draw a simple placeholder
    ctx.fillStyle = '#1F2937';
    ctx.fillRect(0, 0, 400, 300);
    
    ctx.fillStyle = '#374151';
    ctx.fillRect(160, 110, 80, 80);
    
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Image not available', 200, 220);
    
    // Save as PNG
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    console.log('✅ Fallback image created with canvas');
  }
}

// Check if we can use the script
try {
  generateFallbackImage();
} catch (error) {
  // If dependencies are missing, create a basic placeholder using built-in Node.js
  const outputPath = path.join(__dirname, '../public/static/images/fallback.png');
  
  // Create a minimal 1x1 pixel gray PNG
  const grayPixelPNG = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
    0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41, // IDAT chunk
    0x54, 0x08, 0xd7, 0x63, 0x60, 0x60, 0x60, 0x00,
    0x00, 0x00, 0x04, 0x00, 0x01, 0x5c, 0xcd, 0xff,
    0x69, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, // IEND chunk
    0x44, 0xae, 0x42, 0x60, 0x82
  ]);
  
  fs.writeFileSync(outputPath, grayPixelPNG);
  console.log('✅ Basic fallback image created');
}