const fs = require('fs');
const path = require('path');

// Simple script to generate placeholder PWA icons
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Base64 encoded 1x1 blue pixel PNG as placeholder
const bluePixelPNG = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
  0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
  0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41, // IDAT chunk
  0x54, 0x08, 0xd7, 0x63, 0x38, 0xc2, 0xf0, 0x0c,
  0x00, 0x01, 0x2a, 0x00, 0x5f, 0x5a, 0x7f, 0xb6,
  0x91, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, // IEND chunk
  0x44, 0xae, 0x42, 0x60, 0x82
]);

// Generate icon placeholder files
sizes.forEach(size => {
  const filename = path.join(__dirname, '..', 'public', 'icons', `icon-${size}x${size}.png`);
  fs.writeFileSync(filename, bluePixelPNG);
  console.log(`✅ Created ${filename}`);
});

// Create badge icon
fs.writeFileSync(
  path.join(__dirname, '..', 'public', 'icons', 'badge-96x96.png'),
  bluePixelPNG
);

// Create shortcut icons
['dashboard', 'transactions', 'inventory', 'analytics'].forEach(name => {
  fs.writeFileSync(
    path.join(__dirname, '..', 'public', 'icons', `shortcut-${name}.png`),
    bluePixelPNG
  );
});

// Create action icons
['approve', 'view', 'dismiss'].forEach(action => {
  fs.writeFileSync(
    path.join(__dirname, '..', 'public', 'icons', `action-${action}.png`),
    bluePixelPNG
  );
});

console.log('✅ All PWA icons created successfully');