const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Ensure directories exist
const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const assetsDir = path.join(__dirname, '../src/assets/images');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Master SVG Design (Squircle background + stylized modern geometric S)
const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <rect width="512" height="512" rx="112" fill="#7c3aed" />
  <path d="M 360,128 L 224,128 A 64,64 0 0,0 160,192 A 64,64 0 0,0 224,256 L 288,256 A 64,64 0 0,1 352,320 A 64,64 0 0,1 288,384 L 152,384" 
        fill="none" 
        stroke="#ffffff" 
        stroke-width="52" 
        stroke-linecap="round" 
        stroke-linejoin="round" />
</svg>`;

// Pinned Tab SVG (Safari requires black or flat color vector on transparent bg)
const maskSvgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <path d="M 360,128 L 224,128 A 64,64 0 0,0 160,192 A 64,64 0 0,0 224,256 L 288,256 A 64,64 0 0,1 352,320 A 64,64 0 0,1 288,384 L 152,384" 
        fill="none" 
        stroke="#7c3aed" 
        stroke-width="52" 
        stroke-linecap="round" 
        stroke-linejoin="round" />
</svg>`;

// ICO packer function
function createIco(pngBuffers) {
  // HEADER: 6 bytes
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type: 1 = ICO
  header.writeUInt16LE(pngBuffers.length, 4); // Number of images

  const directorySize = pngBuffers.length * 16;
  const entries = [];
  let offset = 6 + directorySize;

  for (const item of pngBuffers) {
    const entry = Buffer.alloc(16);
    const width = item.width >= 256 ? 0 : item.width;
    const height = item.height >= 256 ? 0 : item.height;

    entry.writeUInt8(width, 0);          // Width
    entry.writeUInt8(height, 1);         // Height
    entry.writeUInt8(0, 2);              // Palette colors (0 = no palette)
    entry.writeUInt8(0, 3);              // Reserved
    entry.writeUInt16LE(1, 4);           // Color planes
    entry.writeUInt16LE(32, 6);          // Bits per pixel
    entry.writeUInt32LE(item.buffer.length, 8); // Image data size
    entry.writeUInt32LE(offset, 12);     // Offset

    entries.push(entry);
    offset += item.buffer.length;
  }

  return Buffer.concat([header, ...entries, ...pngBuffers.map(x => x.buffer)]);
}

async function main() {
  console.log("Generating premium favicons...");

  // Write SVGs
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent);
  fs.writeFileSync(path.join(publicDir, 'mask-icon.svg'), maskSvgContent);

  // Define PNG configurations
  const pngConfigs = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'android-chrome-512x512.png', size: 512 }
  ];

  const icoSources = [];

  for (const config of pngConfigs) {
    console.log(`Rendering ${config.name} at ${config.size}x${config.size}...`);
    const buffer = await sharp(Buffer.from(svgContent))
      .resize(config.size, config.size)
      .png()
      .toBuffer();

    fs.writeFileSync(path.join(publicDir, config.name), buffer);

    if (config.size === 16 || config.size === 32) {
      icoSources.push({ buffer, width: config.size, height: config.size });
    }
  }

  // Generate favicon.ico
  console.log("Packing favicon.ico...");
  const icoBuffer = createIco(icoSources);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);

  // Replace fallback JPG in assets with a beautiful PNG/JPG version of our premium icon
  console.log("Replacing fallback image assets...");
  const fallbackPng = await sharp(Buffer.from(svgContent))
    .resize(512, 512)
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(assetsDir, 'favicon_1784448791141.jpg'), fallbackPng); // Write PNG under JPG name so any reference is preserved and upgraded to premium brand!
  
  // Create site.webmanifest
  const manifest = {
    name: "Suman Web Design Agency",
    short_name: "Suman Design",
    description: "Premium Website Design & Development Agency Portfolio",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable"
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ],
    theme_color: "#7c3aed",
    background_color: "#030303",
    display: "standalone",
    start_url: "/"
  };

  fs.writeFileSync(
    path.join(publicDir, 'site.webmanifest'), 
    JSON.stringify(manifest, null, 2)
  );

  console.log("All favicons generated successfully!");
}

main().catch(err => {
  console.error("Error generating favicons:", err);
  process.exit(1);
});
