const fs = require('fs');
const path = require('path');
const os = require('os');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

const TOTAL = 2222;
const PROJECT_ROOT = path.join(__dirname, '..');
const SVG_DIR = path.join(PROJECT_ROOT, 'metadata', 'images');
const PNG_DIR = path.join(PROJECT_ROOT, 'ART_PHOTOS_PNG');

if (!fs.existsSync(PNG_DIR)) {
  fs.mkdirSync(PNG_DIR, { recursive: true });
}

if (isMainThread) {
  const numWorkers = Math.min(12, os.cpus().length || 4);
  console.log(`Starting parallel PNG rasterization across ${numWorkers} worker threads...`);

  const chunkSize = Math.ceil(TOTAL / numWorkers);
  const startTime = Date.now();
  let completedWorkers = 0;

  for (let i = 0; i < numWorkers; i++) {
    const startId = i * chunkSize + 1;
    const endId = Math.min(TOTAL, (i + 1) * chunkSize);

    if (startId > TOTAL) break;

    const worker = new Worker(__filename, {
      workerData: { startId, endId, SVG_DIR, PNG_DIR }
    });

    worker.on('message', (msg) => {
      if (msg.done) {
        completedWorkers++;
        if (completedWorkers === numWorkers) {
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
          console.log(`\nALL 2,222 PNG PHOTOS COMPLETED IN ${elapsed} SECONDS!`);
          console.log(`Saved to: ${PNG_DIR}`);
        }
      }
    });

    worker.on('error', (err) => console.error('Worker error:', err));
  }
} else {
  const { Resvg } = require('@resvg/resvg-js');
  const { startId, endId, SVG_DIR, PNG_DIR } = workerData;

  for (let id = startId; id <= endId; id++) {
    const svgPath = path.join(SVG_DIR, `${id}.svg`);
    const pngPath = path.join(PNG_DIR, `Guardian_${String(id).padStart(4, '0')}.png`);

    if (!fs.existsSync(svgPath)) continue;

    try {
      const svg = fs.readFileSync(svgPath, 'utf8');
      const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 800 } });
      const pngData = resvg.render();
      fs.writeFileSync(pngPath, pngData.asPng());
    } catch (e) {
      console.error(`Failed on #${id}:`, e);
    }
  }

  parentPort.postMessage({ done: true });
}
