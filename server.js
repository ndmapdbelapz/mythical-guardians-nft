const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT_DIR = __dirname;
const WEB_DIR = path.join(ROOT_DIR, 'web');
const CONTRACT_JSON_PATH = path.join(WEB_DIR, 'assets', 'contract_address.json');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const urlObj = new URL(req.url, `http://${req.headers.host || '127.0.0.1:3000'}`);
  const reqPath = decodeURI(urlObj.pathname);

  // API Route: Save contract address
  if (reqPath === '/api/contract' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        fs.writeFileSync(CONTRACT_JSON_PATH, JSON.stringify(data, null, 2));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, contract: data }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // API Route: Get contract address
  if (reqPath === '/api/contract' && req.method === 'GET') {
    if (fs.existsSync(CONTRACT_JSON_PATH)) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      fs.createReadStream(CONTRACT_JSON_PATH).pipe(res);
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ address: null, network: "Robinhood Chain Mainnet", chainId: 4663 }));
    }
    return;
  }

  let filePath = path.join(WEB_DIR, reqPath === '/' ? 'index.html' : reqPath);

  // Allow accessing metadata directory
  if (reqPath.startsWith('/metadata/')) {
    filePath = path.join(ROOT_DIR, reqPath);
  }
  // Allow accessing ART_PHOTOS_PNG directory
  if (reqPath.startsWith('/ART_PHOTOS_PNG/')) {
    filePath = path.join(ROOT_DIR, reqPath);
  }
  // Allow accessing contracts artifacts
  if (reqPath.startsWith('/contracts/')) {
    filePath = path.join(ROOT_DIR, reqPath);
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found: ' + reqPath);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Mythical Beasts Portal running at http://127.0.0.1:${PORT}`);
});
