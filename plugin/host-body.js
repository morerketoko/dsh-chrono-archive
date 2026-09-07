// Chrono Archive · Host 半区（镜像文件；与 cordis_define code.host 一致）v5
// - 新增「自设壁纸」：wallpaper-set / wallpaper-clear RPC + art/user.wall.txt 持久化
return {
  apply(ctx) {
    const CHRONO_DIR = 'F:\\dsh试验工作区\\chrono-archive';
    const OVERRIDE_FILE = CHRONO_DIR + '\\art\\user.wall.txt';
    const disposers = [];
    ctx.effect(() => () => { for (const d of disposers) { try { d(); } catch (_) {} } }, 'chrono-archive: host cleanup');
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
    const fs = ctx.get('fs');
    if (fs !== undefined) {
      const favPath = CHRONO_DIR + '\\assets\\favicon.svg';
      readFileText(fs, favPath).then((svg) => {
        if (!svg) return;
        try {
          const dataUrl = 'data:image/svg+xml;base64,' + btoa(svg);
          const tap = (html) => {
            const fav = '<link rel="icon" type="image/svg+xml" href="' + dataUrl + '" data-chrono="1"/>';
            let h = html;
            if (h.indexOf('data-chrono="1"') === -1) {
              if (h.indexOf('rel="icon"') !== -1) h = h.replace(/<link[^>]*rel="icon"[^>]*\/?>/i, fav);
              else h = h.replace('</head>', fav + '</head>');
            }
            return h;
          };
          const webServer = ctx.get('webServer');
          if (webServer !== undefined) disposers.push(webServer.tapIndex(tap));
        } catch (err) { console.error('[chrono-archive] favicon inject failed', err && err.message); }
      });
    }
    if (fs === undefined) return;
    const webServer = ctx.get('webServer');
    if (webServer === undefined) return;

    async function loadState() {
      const doc = await readFileText(fs, CHRONO_DIR + '\\wallpapers.txt');
      const parsed = parseWallpaperDoc(doc || '');
      // 自设壁纸覆盖：art/user.wall.txt 若存在且可读，则只展示该张
      let walls = parsed.walls.map((w, i) => ({ key: 'w' + i, file: w.path, pos: w.pos || '' }));
      const overrideRaw = await readFileText(fs, OVERRIDE_FILE);
      const overridePath = (overrideRaw || '').trim();
      if (overridePath) {
        try {
          const target = await fs.resolve(overridePath);
          const info = await fs.stat(target);
          if (info && info.type === 'file') {
            walls = [{ key: 'u0', file: overridePath, pos: '' }];
          }
        } catch (_) { /* 不可读则回退默认清单 */ }
      }
      // 校验默认清单每项
      const valid = [];
      for (const w of walls) {
        try {
          const target = await fs.resolve(w.file);
          const info = await fs.stat(target);
          if (info && info.type === 'file') valid.push(w);
        } catch (_) { }
      }
      const base = {
        light: parsePalette(await readFileText(fs, CHRONO_DIR + '\\palettes\\light.txt')),
        dark: parsePalette(await readFileText(fs, CHRONO_DIR + '\\palettes\\dark.txt')),
      };
      for (const w of valid) {
        const name = w.file.replace(/\\/g, '/').split('/').pop().replace(/\.[^.]+$/, '');
        for (const scheme of ['light', 'dark']) {
          const extra = parsePalette(await readFileText(fs, CHRONO_DIR + '\\palettes\\' + name + '.' + scheme + '.txt'));
          for (const k of Object.keys(extra)) base[scheme][k] = extra[k];
        }
      }
      return { parsed, walls: valid, palettes: base };
    }
    let wallFiles = new Map();
    const MIME = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif' };
    async function refreshState() {
      const st = await loadState();
      wallFiles = new Map();
      for (const w of st.walls) {
        const ext = (w.file.match(/\.([a-zA-Z0-9]+)$/) || [])[1] || 'png';
        wallFiles.set(w.key, { path: w.file, mime: MIME[ext.toLowerCase()] || 'application/octet-stream' });
      }
      return st;
    }
    const wallUrls = (st) => st.walls.map((w) => ({ key: w.key, url: '/chrono-assets/' + w.key + '.img', pos: w.pos }));

    disposers.push(harness.handle('chrono/config', async () => {
      try {
        const st = await refreshState();
        return { ok: true, settings: st.parsed.settings, wallpapers: wallUrls(st), palettes: st.palettes };
      } catch (err) {
        console.error('[chrono-archive] config failed', err && err.message);
        return { ok: false };
      }
    }));
    disposers.push(harness.handle('chrono/css', async () => {
      try { return { ok: true, css: await readFileText(fs, CHRONO_DIR + '\\skin.css') }; }
      catch (err) { return { ok: false }; }
    }));
    // 自设壁纸：写入 art/user.wall.txt（路径），下一轮 config 生效
    disposers.push(harness.handle('chrono/wallpaper-set', async (args) => {
      try {
        const path = (args && typeof args.path === 'string' ? args.path.trim() : '');
        if (!path) return { ok: false, error: 'empty path' };
        const target = await fs.resolve(path);
        const info = await fs.stat(target);
        if (!info || info.type !== 'file') return { ok: false, error: 'not a file' };
        const overrideTarget = await fs.resolve(OVERRIDE_FILE);
        await fs.writeText(overrideTarget, path);
        const st = await refreshState();
        return { ok: true, wallpapers: wallUrls(st) };
      } catch (err) {
        return { ok: false, error: String((err && err.message) || err) };
      }
    }));
    disposers.push(harness.handle('chrono/wallpaper-clear', async () => {
      try {
        const overrideTarget = await fs.resolve(OVERRIDE_FILE);
        await fs.writeText(overrideTarget, '');
        const st = await refreshState();
        return { ok: true, wallpapers: wallUrls(st) };
      } catch (err) {
        return { ok: false, error: String((err && err.message) || err) };
      }
    }));

    disposers.push(webServer.register({
      kind: 'prefix',
      path: '/chrono-assets',
      handler: async (req, res) => {
        try {
          const pathname = (req.url || '').split('?')[0];
          const key = (pathname.split('/').pop() || '').replace(/\.img$/, '');
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
        } catch (err) {
          res.statusCode = 500;
          res.end('asset error');
        }
      },
    }));
  },
};
