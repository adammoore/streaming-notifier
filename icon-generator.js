// icon-generator.js
// Run this script with: node icon-generator.js
// Make sure to install sharp first: npm install sharp

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  // Create a simple colored square with a bell icon as base
  const svg = `
    <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
      <rect width="512" height="512" fill="#4f46e5" rx="50"/>
      <g transform="translate(128, 128)">
        <path 
          d="M128 24C68.353 24 20 72.353 20 132v100l-20 20v40h256v-40l-20-20V132c0-59.647-48.353-108-108-108zm0 308c17.673 0 32-14.327 32-32H96c0 17.673 14.327 32 32 32z" 
          fill="white"
          stroke="white"
          stroke-width="8"
        />
      </g>
    </svg>
  `;

  // Ensure icons directory exists
  const iconsDir = path.join(__dirname, 'public', 'icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // Generate icons for each size
  console.log('Generating icons...');
  for (const size of sizes) {
    try {
      await sharp(Buffer.from(svg))
        .resize(size, size)
        .png()
        .toFile(path.join(iconsDir, `icon-${size}x${size}.png`));
      console.log(`✓ Generated ${size}x${size} icon`);
    } catch (error) {
      console.error(`✗ Failed to generate ${size}x${size} icon:`, error);
    }
  }
  
  console.log('Icon generation complete!');
}

// Run the generator
generateIcons().catch(console.error);
