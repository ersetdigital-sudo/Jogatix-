const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8'
};

const server = http.createServer((req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');

  const parsedUrl = url.parse(req.url);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Normalize path
  const cleanPath = pathname.replace(/\/+$/, '') || '/';

  // Prevent path traversal
  const safeRelative = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');

  const candidates = [];

  if (cleanPath === '/') {
    candidates.push(path.join(ROOT_DIR, 'index.html'));
  } else {
    // Check if sub-route like /layanan/uang-elektronik
    if (cleanPath.startsWith('/layanan/')) {
      const subCat = cleanPath.replace(/^\/layanan\/?/, '');
      if (subCat && !subCat.includes('.')) {
        res.writeHead(302, { 'Location': `/layanan.html?kategori=${encodeURIComponent(subCat)}` });
        res.end();
        return;
      }
    }

    // 1. Direct file in ROOT_DIR
    candidates.push(path.join(ROOT_DIR, safeRelative));
    // 2. Direct with .html appended
    candidates.push(path.join(ROOT_DIR, safeRelative + '.html'));
    // 3. Fallbacks for aliases
    if (cleanPath === '/checkout') {
      candidates.push(path.join(ROOT_DIR, 'transaksi.html'));
    }
    if (cleanPath === '/admin') {
      candidates.push(path.join(ROOT_DIR, 'admin.html'));
    }
  }

  let matchedFile = null;
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      try {
        const stat = fs.statSync(candidate);
        if (stat.isFile()) {
          matchedFile = candidate;
          break;
        }
      } catch (e) {}
    }
  }

  if (matchedFile && matchedFile.startsWith(ROOT_DIR)) {
    const ext = path.extname(matchedFile).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    const readStream = fs.createReadStream(matchedFile);
    readStream.pipe(res);
    return;
  }

  // 404 fallback
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Halaman Tidak Ditemukan - Jogatix</title>
  <style>
    body { font-family: 'Inter', -apple-system, sans-serif; background: #F8FAFC; color: #0E1126; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    .box { background: white; padding: 40px; border-radius: 16px; border: 1px solid #E2E8F0; text-align: center; max-width: 420px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); }
    h1 { font-size: 22px; margin-bottom: 12px; color: #0E1126; }
    p { color: #64748B; font-size: 14.5px; margin-bottom: 24px; line-height: 1.5; }
    a { display: inline-block; background: #4338CA; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px; }
  </style>
</head>
<body>
  <div class="box">
    <h1>Halaman Tidak Ditemukan</h1>
    <p>Halaman yang kamu cari tidak tersedia. Periksa kembali tautan atau kembali ke beranda Jogatix.</p>
    <a href="/">Kembali ke Beranda</a>
  </div>
</body>
</html>`);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Jogatix server running on port ${PORT}`);
});
