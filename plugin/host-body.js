// Chrono Archive · Host 半区（镜像文件；与 cordis_define code.host 完全一致）
// 职责：读取 chrono-archive 工程配置、经官方 webServer 服务本地壁纸、
//       在 index 注入原创 favicon/title。全部副作用随插件停止自动移除。
return {
  apply(ctx) {
    const CHRONO_DIR = 'F:\\dsh试验工作区\\chrono-archive';
    const disposers = [];
    ctx.effect(() => () => { for (const d of disposers) { try { d(); } catch (_) {} } }, 'chrono-archive: host cleanup');

    // ---------- 工具 ----------
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

    // ---------- 解析 wallpapers.txt ----------
    function parseWallpaperDoc(text) {
      const settings = { pos: 'center 38%', size: 'cover', opacity: 0.5, blur: '3px', sat: 1, contrast: 1.02, cycleSeconds: 300, solidity: 0.8 };
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

    // ---------- 启动时只做 favicon/title 注入（不依赖 fs 也行）----------
    const fs = ctx.get('fs');
    if (fs !== undefined) {
      // favicon：读到 assets/favicon.svg → 以 base64 data URI 注入 <link>
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

    // ---------- 资产路由 + RPC（都需要 fs）----------
    if (fs === undefined) return;
    const webServer = ctx.get('webServer');
    if (webServer === undefined) return;

    // 每次 config 请求都重新扫描清单与调色板（换壁纸无需重载插件）
    async function loadState() {
      const doc = await readFileText(fs, CHRONO_DIR + '\\wallpapers.txt');
      const parsed = parseWallpaperDoc(doc || '');
      const walls = [];
      for (let i = 0; i < parsed.walls.length; i++) {
        const w = parsed.walls[i];
        try {
          const target = await fs.resolve(w.path);
          const info = await fs.stat(target);
          if (info && info.type === 'file') {
            walls.push({ key: 'w' + i, file: w.path, pos: w.pos || '' });
          }
        } catch (_) { /* 文件不存在或不可读 → 跳过 */ }
      }
      // 调色板：默认 light/dark + 按壁纸名覆盖
      const base = {
        light: parsePalette(await readFileText(fs, CHRONO_DIR + '\\palettes\\light.txt')),
        dark: parsePalette(await readFileText(fs, CHRONO_DIR + '\\palettes\\dark.txt')),
      };
      for (const w of walls) {
        const name = w.file.replace(/\\/g, '/').split('/').pop().replace(/\.[^.]+$/, '');
        for (const scheme of ['light', 'dark']) {
          const extra = parsePalette(await readFileText(fs, CHRONO_DIR + '\\palettes\\' + name + '.' + scheme + '.txt'));
          for (const k of Object.keys(extra)) base[scheme][k] = extra[k];
        }
      }
      return { parsed, walls, palettes: base };
    }

    let lastState = null;
    let wallFiles = new Map(); // key -> { path, ext, mime }
    const MIME = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif' };
    async function refreshState() {
      const st = await loadState();
      lastState = st;
      wallFiles = new Map();
      for (const w of st.walls) {
        const ext = (w.file.match(/\.([a-zA-Z0-9]+)$/) || [])[1] || 'png';
        wallFiles.set(w.key, { path: w.file, mime: MIME[ext.toLowerCase()] || 'application/octet-stream' });
      }
      return st;
    }

    disposers.push(harness.handle('chrono/config', async () => {
      try {
        const st = await refreshState();
        const urls = st.walls.map((w) => ({ key: w.key, url: '/chrono-assets/' + w.key + '.img', pos: w.pos }));
        return { ok: true, settings: st.parsed.settings, wallpapers: urls, palettes: st.palettes };
      } catch (err) {
        console.error('[chrono-archive] config failed', err && err.message);
        return { ok: false };
      }
    }));
    disposers.push(harness.handle('chrono/css', async () => {
      try { return { ok: true, css: await readFileText(fs, CHRONO_DIR + '\\skin.css') }; }
      catch (err) { return { ok: false }; }
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
