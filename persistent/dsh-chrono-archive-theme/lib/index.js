// Chrono Archive · persistent host half (web profile bundle)
const CHRONO_DIR = 'F:\\dsh试验工作区\\chrono-archive';
const OVERRIDE_FILE = CHRONO_DIR + '\\art\\user.wall.txt';

function readFileText(fs, path) {
  return fs.resolve(path).then((target) => fs.readText(target)).catch(() => null);
}
function parseLines(text) {
  const out = [];
  if (!text) return out;
  for (const raw of String(text).split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    out.push(line);
  }
  return out;
}
function parsePalette(text) {
  const map = {};
  for (const line of parseLines(text)) {
    const i = line.indexOf(':');
    if (i <= 0) continue;
    const key = line.slice(0, i).trim();
    const value = line.slice(i + 1).trim();
    if (key && value) map[key] = value;
  }
  return map;
}
function num(v, d) { const n = Number.parseFloat(v); return Number.isFinite(n) ? n : d; }
function parseWallpaperDoc(text) {
  const settings = { pos: 'center 38%', size: 'cover', opacity: 0.68, blur: '0px', sat: 1.05, contrast: 1, cycleSeconds: 300, solidity: 0.72 };
  const walls = [];
  for (const line of parseLines(text)) {
    if (line.startsWith('@')) {
      const sp = line.indexOf(' ');
      if (sp <= 0) continue;
      const key = line.slice(1, sp).toLowerCase();
      const value = line.slice(sp + 1).trim();
      if (key === 'pos') settings.pos = value;
      else if (key === 'size') settings.size = value;
      else if (key === 'opacity') settings.opacity = Math.min(1, Math.max(0, num(value, settings.opacity)));
      else if (key === 'blur') settings.blur = value;
      else if (key === 'sat') settings.sat = num(value, settings.sat);
      else if (key === 'contrast') settings.contrast = num(value, settings.contrast);
      else if (key === 'cycle') settings.cycleSeconds = Math.max(0, num(value, settings.cycleSeconds));
      else if (key === 'solidity') settings.solidity = Math.min(1, Math.max(0.3, num(value, settings.solidity)));
      continue;
    }
    const sep = line.indexOf(' :: ');
    const path = (sep >= 0 ? line.slice(0, sep) : line).trim();
    const pos = sep >= 0 ? line.slice(sep + 4).trim() : '';
    if (path) walls.push({ path, pos });
  }
  return { settings, walls };
}
function readJsonBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => { data += c; if (data.length > 64 * 1024) req.destroy(); });
    req.on('end', () => { try { resolve(JSON.parse(data || '{}')); } catch (_) { resolve({}); } });
    req.on('error', () => resolve({}));
  });
}
function sendJson(res, code, obj) {
  const body = JSON.stringify(obj);
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Length', String(Buffer.byteLength(body)));
  res.end(body);
}
export async function apply(ctx) {
  const disposers = [];
  ctx.effect(() => () => { for (const d of disposers) { try { d(); } catch (_) {} } }, 'chrono-archive: host cleanup');
  const fs = ctx.get('fs');
  const webServer = ctx.get('webServer');
  if (fs === undefined || webServer === undefined) return;

  const MIME = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif' };
  let wallFiles = new Map();
  let cachedConfig = null;

  async function loadState() {
    const doc = await readFileText(fs, CHRONO_DIR + '\\wallpapers.txt');
    const parsed = parseWallpaperDoc(doc || '');
    let walls = parsed.walls.map((w, i) => ({ key: 'w' + i, file: w.path, pos: w.pos || '' }));
    const overrideRaw = await readFileText(fs, OVERRIDE_FILE);
    const overridePath = (overrideRaw || '').trim();
    if (overridePath) {
      try {
        const target = await fs.resolve(overridePath);
        const info = await fs.stat(target);
        if (info && info.type === 'file') walls = [{ key: 'u0', file: overridePath, pos: '' }];
      } catch (_) { }
    }
    const valid = [];
    for (const w of walls) {
      try {
        const target = await fs.resolve(w.file);
        const info = await fs.stat(target);
        if (info && info.type === 'file') valid.push(w);
      } catch (_) { }
    }
    const palettes = {
      light: parsePalette(await readFileText(fs, CHRONO_DIR + '\\palettes\\light.txt')),
      dark: parsePalette(await readFileText(fs, CHRONO_DIR + '\\palettes\\dark.txt')),
    };
    const css = await readFileText(fs, CHRONO_DIR + '\\skin.css');
    return { parsed, walls: valid, palettes, css };
  }
  async function refresh() {
    const st = await loadState();
    cachedConfig = st;
    wallFiles = new Map();
    for (const w of st.walls) {
      const ext = (w.file.match(/\.([a-zA-Z0-9]+)$/) || [])[1] || 'png';
      wallFiles.set(w.key, { path: w.file, mime: MIME[ext.toLowerCase()] || 'application/octet-stream' });
    }
    return st;
  }
  const toView = (st) => ({
    ok: true,
    settings: st.parsed.settings,
    palettes: st.palettes,
    css: st.css,
    wallpapers: st.walls.map((w) => ({ key: w.key, url: '/chrono-assets/' + w.key + '.img', pos: w.pos })),
  });

  // favicon tap
  const favSvg = await readFileText(fs, CHRONO_DIR + '\\assets\\favicon.svg');
  if (favSvg) {
    const dataUrl = 'data:image/svg+xml;base64,' + Buffer.from(favSvg, 'utf8').toString('base64');
    disposers.push(webServer.tapIndex((html) => {
      const fav = '<link rel="icon" type="image/svg+xml" href="' + dataUrl + '" data-chrono="1"/>';
      let h = html;
      if (h.indexOf('data-chrono="1"') === -1) {
        if (h.indexOf('rel="icon"') !== -1) h = h.replace(/<link[^>]*rel="icon"[^>]*\/?>/i, fav);
        else h = h.replace('</head>', fav + '</head>');
      }
      return h;
    }));
  }

  disposers.push(webServer.register({ kind: 'exact', path: '/chrono-config.json', handler: async (req, res) => {
    try { sendJson(res, 200, toView(await refresh())); }
    catch (err) { sendJson(res, 500, { ok: false, error: String(err && err.message || err) }); }
  } }));
  disposers.push(webServer.register({ kind: 'exact', path: '/chrono-wall-set', handler: async (req, res) => {
    try {
      const args = await readJsonBody(req);
      const path = String(args.path || '').trim();
      if (!path) return sendJson(res, 400, { ok: false, error: 'empty path' });
      const target = await fs.resolve(path);
      const info = await fs.stat(target);
      if (!info || info.type !== 'file') return sendJson(res, 400, { ok: false, error: 'not a file' });
      const ot = await fs.resolve(OVERRIDE_FILE);
      await fs.writeText(ot, path);
      sendJson(res, 200, toView(await refresh()));
    } catch (err) { sendJson(res, 500, { ok: false, error: String(err && err.message || err) }); }
  } }));
  disposers.push(webServer.register({ kind: 'exact', path: '/chrono-wall-clear', handler: async (req, res) => {
    try {
      const ot = await fs.resolve(OVERRIDE_FILE);
      await fs.writeText(ot, '');
      sendJson(res, 200, toView(await refresh()));
    } catch (err) { sendJson(res, 500, { ok: false, error: String(err && err.message || err) }); }
  } }));
  disposers.push(webServer.register({ kind: 'prefix', path: '/chrono-assets', handler: async (req, res) => {
    try {
      const key = ((req.url || '').split('?')[0].split('/').pop() || '').replace(/\.img$/, '');
      const entry = wallFiles.get(key);
      if (!entry) { res.statusCode = 404; res.end('not found'); return; }
      const target = await fs.resolve(entry.path);
      const info = await fs.stat(target);
      const max = Math.min(info && info.size ? info.size : 64 * 1024 * 1024, 64 * 1024 * 1024);
      const bytes = await fs.readBytes(target, undefined, max);
      res.statusCode = 200;
      res.setHeader('Content-Type', entry.mime);
      res.setHeader('Content-Length', String(bytes.byteLength));
      res.setHeader('Cache-Control', 'public, max-age=1800');
      res.end(bytes);
    } catch (_) { res.statusCode = 500; res.end('asset error'); }
  } }));
}
