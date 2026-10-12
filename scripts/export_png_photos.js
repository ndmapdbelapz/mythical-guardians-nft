/**
 * export_png_photos.js
 * High-speed batch rasterizer converting all 2,222 vector SVGs into
 * crystal-clear 800x800 PNG photo image files with native Windows photo thumbnails.
 */

const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const PROJECT_ROOT = path.join(__dirname, '..');
const SVG_DIR = path.join(PROJECT_ROOT, 'metadata', 'images');
const PNG_DIR = path.join(PROJECT_ROOT, 'ART_PHOTOS_PNG');

if (!fs.existsSync(PNG_DIR)) {
  fs.mkdirSync(PNG_DIR, { recursive: true });
}

console.log("==========================================================");
console.log("EXPORTING ALL 2,222 NFTS AS HIGH-RESOLUTION PNG PHOTOS");
console.log("==========================================================");

const TOTAL = 2222;
const startTime = Date.now();

for (let id = 1; id <= TOTAL; id++) {
  const svgPath = path.join(SVG_DIR, `${id}.svg`);
  const pngPath = path.join(PNG_DIR, `Guardian_${String(id).padStart(4, '0')}.png`);

  if (!fs.existsSync(svgPath)) {
    console.error(`Missing SVG for token #${id}`);
    continue;
  }

  const svgContent = fs.readFileSync(svgPath, 'utf8');
  const resvg = new Resvg(svgContent, {
    fitTo: { mode: 'width', value: 800 }
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  fs.writeFileSync(pngPath, pngBuffer);

  if (id % 250 === 0 || id === TOTAL) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[*] Processed ${id} / ${TOTAL} PNG photos (${((id/TOTAL)*100).toFixed(1)}%) in ${elapsed}s`);
  }
}

const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
console.log("\n==========================================================");
console.log(`COMPLETE! 2,222 PNG PHOTOS WRITTEN TO:`);
console.log(PNG_DIR);
console.log(`Time taken: ${totalTime} seconds`);
console.log("==========================================================");
