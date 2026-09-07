// Chrono Archive · Client 半区（镜像文件；与 cordis_define code.client 完全一致）
// 职责：读取 Host 提供的配置/CSS，用官方 theme.overrideTokens 应用双色板 token，
//       用 styles.insert 注入皮肤 CSS，注册字标/印章/氛围/装饰插槽，驱动多壁纸轮换。

const FALLBACK_LIGHT = { canvas: '#EDE6D4', base: '#E6DCC6', raised: '#F3ECD9', overlayBg: '#FBF6E9', ink: '#32291E', inkSoft: '#5F5540', inkMuted: '#8A7D63', accent: '#96732B', accentSoft: '#B78F3E', accentPale: '#E3C467', wine: '#8A4438', pine: '#52705A', slate: '#526173', link: '#4A5F86', success: '#55785A', warn: '#9A7A2E', danger: '#A3483C', codeBg: '#F2EAD6', codeBanner: '#E9DFC6', codeInline: '#F6EFDE', selection: '#D9C084' };
const FALLBACK_DARK = { canvas: '#101319', base: '#161A22', raised: '#1D232D', overlayBg: '#1B212B', ink: '#EAE2CE', inkSoft: '#BCB39D', inkMuted: '#8F8673', accent: '#C9A24B', accentSoft: '#DFBE6E', accentPale: '#EAD08F', wine: '#A05244', pine: '#6E8D72', slate: '#7E93A8', link: '#A9BFE0', success: '#83A987', warn: '#D9AF5E', danger: '#C96B5B', codeBg: '#0F141C', codeBanner: '#171E29', codeInline: '#232B37', selection: '#8A6F2F' };

function parsePalette(text) {
  const map = {};
  if (!text) return map;
  for (const raw of String(text).split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const i = line.indexOf(':');
    if (i <= 0) continue;
    const key = line.slice(0, i).trim();
    const value = line.slice(i + 1).trim();
    if (key && value) map[key] = value;
  }
  return map;
}
function hexRgb(h) {
  let s = String(h || '').trim().replace(/^#/, '');
  if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
  const n = Number.parseInt(s, 16);
  if (s.length !== 6 || Number.isNaN(n)) return [0, 0, 0];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function alpha(h, a) { const c = hexRgb(h); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
function mix(h1, h2, t) { const a = hexRgb(h1), b = hexRgb(h2); const f = Math.min(1, Math.max(0, t)); const r = Math.round(a[0] + (b[0] - a[0]) * f), g = Math.round(a[1] + (b[1] - a[1]) * f), bl = Math.round(a[2] + (b[2] - a[2]) * f); return '#' + ((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1); }
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// —— 由一份语义 palette 派生整套 --dsw-* 该配色方案的取值 ——
function schemeTokens(p, cfg, dark) {
  const s = clamp(cfg.solidity, 0.3, 1);
  const baseAlpha = clamp(s * 0.8, 0.45, 0.96);
  const sidebarAlpha = clamp(s * 0.62, 0.3, 0.92);
  const layer1Alpha = clamp(s * 0.95, 0.6, 1);
  const accentFill = dark ? p.accent : mix(p.accent, '#000000', 0.16);
  const accentHover = dark ? mix(p.accent, '#000000', 0.12) : mix(p.accent, '#000000', 0.3);
  const fgOnAccent = dark ? '#251D0B' : '#FDF6E4';
  const border = (a) => alpha(p.ink, a);
  const t = {};
  const put = (k, v) => { t[k] = v; };
  put('--dsw-alias-bg-base', alpha(p.base, baseAlpha));
  put('--dsw-alias-bg-layer-1', alpha(dark ? p.raised : mix(p.base, p.raised, 0.35), layer1Alpha));
  put('--dsw-alias-bg-layer-2', p.raised);
  put('--dsw-alias-bg-layer-3', dark ? mix(p.raised, '#000000', 0.25) : p.raised);
  put('--dsw-alias-bg-overlay', alpha(p.overlayBg, 0.985));
  put('--dsw-alias-bg-mask-1', alpha(p.ink, 0.16));
  put('--dsw-alias-bg-mask-2', alpha(p.ink, 0.3));
  put('--dsw-alias-bg-mask-3', alpha(p.ink, 0.46));
  put('--dsw-alias-bg-mask-drop', alpha(p.ink, 0.5));
  put('--dsw-alias-bg-mask-photo', alpha(p.canvas, 0.45));
  put('--dsw-alias-bg-module-platform', p.canvas);
  put('--dsw-alias-bg-multi-select', mix(p.accent, p.base, 0.14));
  put('--dsw-alias-bg-skeleton', mix(p.ink, p.base, 0.08));
  put('--dsw-alias-border-l1', border(0.14));
  put('--dsw-alias-border-l2', border(0.2));
  put('--dsw-alias-border-l2-darkmode-thin', border(0.16));
  put('--dsw-alias-border-l3', border(0.3));
  put('--dsw-alias-border-l4', border(0.44));
  put('--dsw-alias-border-inverted', alpha(p.canvas, 0.5));
  put('--dsw-alias-border-inverted2', alpha(p.canvas, 0.24));
  put('--dsw-alias-brand-primary', dark ? p.accentSoft : mix(p.accent, '#000000', 0.1));
  put('--dsw-alias-brand-primary-invert', p.ink);
  put('--dsw-alias-brand-primary-new-colorprimary-new-color', accentFill);
  put('--dsw-alias-brand-text', dark ? p.accentPale : mix(p.accent, p.canvas, 0.42));
  put('--dsw-alias-button-contrast-fill', p.canvas);
  put('--dsw-alias-button-elevated-fill', p.raised);
  put('--dsw-alias-button-floating-fill', alpha(p.overlayBg, 0.92));
  put('--dsw-alias-button-floating-hover', mix(p.accent, p.overlayBg, 0.1));
  put('--dsw-alias-button-ghost-active-border', border(0.3));
  put('--dsw-alias-button-ghost-active-fill', alpha(p.ink, 0.05));
  put('--dsw-alias-button-ghost-active-hover', alpha(p.ink, 0.09));
  put('--dsw-alias-button-info-fill', mix(p.accent, p.base, 0.16));
  put('--dsw-alias-button-info-hover', mix(p.accent, p.base, 0.24));
  put('--dsw-alias-button-primary-dimmed', mix(accentFill, p.base, 0.5));
  put('--dsw-alias-button-primary-fill', accentFill);
  put('--dsw-alias-button-primary-hover', accentHover);
  put('--dsw-alias-button-tool-bar-fill', alpha(p.ink, 0.045));
  put('--dsw-alias-button-tool-bar-fill-invisible', 'rgba(0,0,0,0)');
  put('--dsw-alias-button-tool-bar-hover', alpha(p.ink, 0.08));
  put('--dsw-alias-interactive-bg-active', alpha(p.ink, 0.11));
  put('--dsw-alias-interactive-bg-hover', alpha(p.ink, 0.07));
  put('--dsw-alias-interactive-bg-hover-accent', mix(p.accent, p.base, 0.14));
  put('--dsw-alias-interactive-bg-hover-danger', mix(p.danger, p.base, 0.12));
  put('--dsw-alias-interactive-bg-hover-solid', alpha(p.ink, 0.1));
  put('--dsw-alias-label-caption', alpha(p.inkMuted, 0.92));
  put('--dsw-alias-label-dimmed', alpha(p.ink, 0.45));
  put('--dsw-alias-label-primary', p.ink);
  put('--dsw-alias-label-primary-bluish', p.ink);
  put('--dsw-alias-label-primary-dimmed', mix(p.ink, p.base, 0.32));
  put('--dsw-alias-label-primary-foreground', fgOnAccent);
  put('--dsw-alias-label-primary-inverted', p.canvas);
  put('--dsw-alias-label-secondary', p.inkSoft);
  put('--dsw-alias-label-tertiary', p.inkMuted);
  put('--dsw-alias-markdown-citation', alpha(p.wine, 0.6));
  put('--dsw-alias-markdown-code-block', p.codeBg);
  put('--dsw-alias-markdown-code-block-banner', p.codeBanner);
  put('--dsw-alias-markdown-code-segment-selected', mix(p.accent, p.codeBg, 0.16));
  put('--dsw-alias-markdown-code-segment-unselected', p.codeBg);
  put('--dsw-alias-markdown-inline-code', p.codeInline);
  put('--dsw-alias-markdown-placeholder', alpha(p.inkMuted, 0.7));
  put('--dsw-alias-markdown-tag', mix(p.pine, p.base, 0.18));
  put('--dsw-alias-scrollbar-bg-l1', alpha(p.inkMuted, 0.3));
  put('--dsw-alias-scrollbar-bg-l2', alpha(p.inkMuted, 0.4));
  put('--dsw-alias-scrollbar-hover-l1', alpha(p.accent, 0.5));
  put('--dsw-alias-scrollbar-hover-l2', alpha(p.accent, 0.62));
  put('--dsw-alias-state-business-primary', dark ? p.accentSoft : mix(p.accent, '#000000', 0.12));
  put('--dsw-alias-state-business-tertiary', dark ? mix(p.accentSoft, p.base, 0.3) : mix(p.accent, p.base, 0.3));
  put('--dsw-alias-state-error-primary', p.danger);
  put('--dsw-alias-state-error-secondary', alpha(p.danger, 0.85));
  put('--dsw-alias-state-success-primary', dark ? mix(p.success, '#ffffff', 0.1) : p.success);
  put('--dsw-alias-state-success-secondary', alpha(dark ? mix(p.success, '#ffffff', 0.1) : p.success, 0.85));
  put('--dsw-alias-state-success-tertiary', mix(p.success, p.base, 0.55));
  put('--dsw-alias-state-warn-label', p.canvas);
  put('--dsw-alias-state-warn-primary', p.warn);
  put('--dsw-alias-state-warn-secondary', alpha(p.warn, 0.85));
  put('--dsw-alias-state-warn-tertiary', mix(p.warn, p.base, 0.55));
  put('--dsw-alias-toast-bg', dark ? p.raised : mix(p.ink, p.canvas, 0.82));
  put('--dsw-alias-tooltip-bg', dark ? p.raised : mix(p.ink, p.canvas, 0.82));
  put('--dsw-specific-bubble', dark ? mix(p.raised, p.accent, 0.08) : mix(p.base, p.accent, 0.07));
  put('--dsw-specific-bubble-highlight', dark ? mix(p.raised, p.accent, 0.18) : mix(p.base, p.accent, 0.13));
  put('--dsw-specific-input-major', dark ? p.raised : p.overlayBg);
  put('--dsw-specific-login-input', dark ? p.raised : p.overlayBg);
  put('--dsw-specific-menu', alpha(p.overlayBg, 0.97));
  put('--dsw-specific-selector', alpha(p.overlayBg, 0.97));
  put('--dsw-specific-sidebar-fill', alpha(p.base, sidebarAlpha));
  put('--dsw-specific-sidebar-nav-item-active', mix(p.accent, p.base, 0.11));
  put('--dsw-specific-sidebar-nav-item-active-accent', mix(p.accent, p.base, 0.2));
  put('--dsw-specific-sidebar-nav-item-hover', alpha(p.ink, 0.06));
  put('--dsw-specific-tip', dark ? mix(p.pine, p.base, 0.16) : mix(p.pine, p.base, 0.08));
  // 供 skin.css 消费的档案语义变量（浅/深两套独立取值）
  const chroma = { '--chrono-canvas': p.canvas, '--chrono-base': p.base, '--chrono-raised': p.raised, '--chrono-overlay-bg': p.overlayBg, '--chrono-ink': p.ink, '--chrono-ink-soft': p.inkSoft, '--chrono-ink-muted': p.inkMuted, '--chrono-accent': accentFill, '--chrono-accent-soft': p.accentSoft, '--chrono-accent-pale': p.accentPale, '--chrono-wine': p.wine, '--chrono-pine': p.pine, '--chrono-slate': p.slate, '--chrono-link': p.link, '--chrono-success': p.success, '--chrono-warn': p.warn, '--chrono-danger': p.danger, '--chrono-code-bg': p.codeBg, '--chrono-code-banner': p.codeBanner, '--chrono-code-inline': p.codeInline, '--chrono-selection': p.selection };
  return Object.assign(t, chroma);
}

// —— 由 light/dark 两套推导结果合成 overrideTokens 需要的 {light,dark} 对 ——
function composeOverrideMap(lightTokens, darkTokens) {
  const names = Object.keys(lightTokens);
  const map = {};
  for (const name of names) {
    const darkValue = darkTokens[name] !== undefined ? darkTokens[name] : lightTokens[name];
    map[name] = { light: lightTokens[name], dark: darkValue };
  }
  return map;
}
function pickPalette(scheme, cfg, filesLight, filesDark) {
  const base = scheme === 'dark' ? FALLBACK_DARK : FALLBACK_LIGHT;
  const over = scheme === 'dark' ? filesDark || {} : filesLight || {};
  const out = {};
  for (const k of Object.keys(base)) out[k] = over[k] !== undefined ? over[k] : base[k];
  for (const k of Object.keys(over)) if (out[k] === undefined) out[k] = over[k];
  return out;
}

// —— 装饰组件（class 全部 .chrono-*，scoped）——
const SERIF = "Georgia, 'Times New Roman', 'Songti SC', 'SimSun', serif";
function SealSvg(props) {
  const inner = props.text || 'CA';
  return React.createElement('svg', { viewBox: '0 0 48 48', 'aria-hidden': 'true' },
    React.createElement('circle', { cx: 24, cy: 24, r: 21, fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, opacity: 0.9 }),
    React.createElement('circle', { cx: 24, cy: 24, r: 16.5, fill: 'none', stroke: 'currentColor', strokeWidth: 0.7, opacity: 0.5 }),
    React.createElement('g', { stroke: 'currentColor', strokeWidth: 1, opacity: 0.85 },
      React.createElement('line', { x1: 3, y1: 24, x2: 7, y2: 24 }),
      React.createElement('line', { x1: 41, y1: 24, x2: 45, y2: 24 }),
      React.createElement('line', { x1: 24, y1: 3, x2: 24, y2: 7 }),
      React.createElement('line', { x1: 24, y1: 41, x2: 24, y2: 45 })),
    React.createElement('text', { x: 24, y: 28.5, textAnchor: 'middle', fontFamily: SERIF, fontSize: 12, fontWeight: 600, letterSpacing: '1', style: { color: 'var(--chrono-ink)' }, fill: 'currentColor' }, inner),
    React.createElement('text', { x: 24, y: 35.5, textAnchor: 'middle', fontFamily: SERIF, fontSize: 4.6, letterSpacing: '1.4', style: { color: 'var(--chrono-accent-soft)' }, fill: 'currentColor', opacity: 0.85 }, '1999'));
}
function ChronoBrandMark(props) {
  const size = Number(props.size) || 24;
  return React.createElement('div', { className: 'chrono-seal', style: { width: size, height: size } }, SealSvg({}));
}
function HeroBrandMark(props) {
  const size = Number(props.size) || 52;
  return React.createElement('div', { className: 'chrono-hero-mark', style: { width: size, height: size } }, SealSvg({ text: '时序' }));
}
function ChronoBrandName() {
  return React.createElement('div', { className: 'chrono-wordmark' },
    React.createElement('span', { className: 'chrono-wordmark-en' }, 'CHRONO ARCHIVE'),
    React.createElement('span', { className: 'chrono-wordmark-zh' }, '时序档案馆'));
}
function ChronoDock() {
  return React.createElement('div', { className: 'chrono-dock' },
    React.createElement('span', { className: 'chrono-dock-label' },
      React.createElement('b', null, 'CHRONO ARCHIVE'), ' · TEMPORAL RECORD · ',
      React.createElement('b', null, '1999')));
}
function ChronoAmbience() {
  return React.createElement('div', { className: 'chrono-ambience' },
    React.createElement('div', { className: 'chrono-grain' }),
    React.createElement('div', { className: 'chrono-ambient-glow' }));
}
function ChronoInfoRow() {
  return React.createElement('div', { className: 'chrono-skin-row' },
    React.createElement('span', { className: 'chrono-skin-row-title' }, 'CHRONO ARCHIVE · 时序档案馆'),
    React.createElement('span', { className: 'chrono-skin-row-sub' }, '皮肤已激活 — 卸载插件即恢复默认外观'));
}

return {
  inject: ['slots', 'theme', 'timer'],
  apply(ctx) {
    const slots = ctx.get('slots');
    const theme = ctx.get('theme');
    const timer = ctx.get('timer');
    if (slots === undefined || theme === undefined || timer === undefined) return;

    let latestDispose = null;
    let intervalDispose = null;
    let alive = true;
    let state = { paletteLight: FALLBACK_LIGHT, paletteDark: FALLBACK_DARK, settings: { pos: 'center 38%', size: 'cover', opacity: 0.5, blur: '3px', sat: 1, contrast: 1.02, cycleSeconds: 0, solidity: 0.8 }, walls: [], index: 0, visible: 'B', artA: '', artB: '', opA: 0, opB: 0 };

    function buildAllTokens() {
      const cfg = state.settings;
      const light = schemeTokens(state.paletteLight, cfg, false);
      const dark = schemeTokens(state.paletteDark, cfg, true);
      return composeOverrideMap(light, dark);
    }
    function paint() {
      if (!alive || theme === undefined) return;
      const cfg = state.settings;
      const pos = state.walls[state.index] && state.walls[state.index].pos ? state.walls[state.index].pos : cfg.pos;
      const artExtra = {
        '--chrono-art-a': state.artA, '--chrono-art-b': state.artB,
        '--chrono-op-a': String(state.opA), '--chrono-op-b': String(state.opB),
        '--chrono-pos': pos, '--chrono-bg-size': cfg.size,
        '--chrono-blur': cfg.blur, '--chrono-sat': String(cfg.sat), '--chrono-contrast': String(cfg.contrast),
      };
      const map = buildAllTokens();
      for (const k of Object.keys(artExtra)) map[k] = { light: artExtra[k], dark: artExtra[k] };
      try {
        const d = theme.overrideTokens('chrono-archive', map);
        latestDispose = d;
      } catch (err) { console.error('[chrono-archive] overrideTokens failed', err && err.message); }
    }
    function urlOf(i) { return state.walls.length ? 'url("' + state.walls[i % state.walls.length].url + '")' : 'none'; }
    function paintInitial() {
      const n = state.walls.length;
      const op = String(state.settings.opacity);
      if (n === 0) { state.artA = 'none'; state.artB = 'none'; state.opA = 0; state.opB = 0; state.visible = 'B'; }
      else if (n === 1) { state.artA = 'none'; state.artB = urlOf(0); state.opA = 0; state.opB = op; state.visible = 'B'; state.index = 0; }
      else { state.artA = urlOf(0); state.artB = urlOf(1); state.opA = op; state.opB = 0; state.visible = 'A'; state.index = 0; }
      paint();
    }
    function advance() {
      const n = state.walls.length;
      if (n < 2) return;
      const next = (state.index + 1) % n;
      const op = String(state.settings.opacity);
      if (state.visible === 'A') {
        // 上层 B 淡入覆盖 A
        state.artB = urlOf(next);
        state.opA = 0; state.opB = op; state.visible = 'B';
      } else {
        // 上层 B 淡出，显露下层 A（新图）
        state.artA = urlOf(next);
        state.opB = 0; state.opA = op; state.visible = 'A';
      }
      state.index = next;
      paint();
    }

    // 注册插槽（随 Run 自动清理）
    slots.inject('sidebar.brand.mark', () => slots.register({ name: 'sidebar.brand.mark' }, ChronoBrandMark));
    slots.inject('sidebar.brand.name', () => slots.register({ name: 'sidebar.brand.name' }, ChronoBrandName));
    slots.inject('conversation.hero.brand.mark', () => slots.register({ name: 'conversation.hero.brand.mark' }, HeroBrandMark));
    slots.inject('conversation.composer.dock', () => slots.register({ name: 'conversation.composer.dock', id: 'chrono-archive', order: 30 }, ChronoDock));
    slots.inject('shell.overlay', () => slots.register({ name: 'shell.overlay', id: 'chrono-archive', order: 90 }, ChronoAmbience));
    slots.inject('settings.general.item', () => slots.register({ name: 'settings.general.item', id: 'chrono-archive', order: 90 }, ChronoInfoRow));

    // 生命周期清理：停止/卸载时收回 token 层与轮换定时器
    ctx.effect(() => () => { alive = false; try { if (latestDispose) latestDispose(); } catch (_) {} try { if (intervalDispose) intervalDispose(); } catch (_) {} }, 'chrono-archive: token layer cleanup');

    // 数据引导：取配置与 CSS（异步，不阻塞注册）
    (async () => {
      try {
        const cfg = await host.call('chrono/config', {});
        if (!cfg || !cfg.ok) return;
        const cssRes = await host.call('chrono/css', {});
        if (cssRes && cssRes.ok && cssRes.css) styles.insert(cssRes.css);
        state.paletteLight = pickPalette('light', cfg.settings, cfg.palettes && cfg.palettes.light, {});
        state.paletteDark = pickPalette('dark', cfg.settings, {}, cfg.palettes && cfg.palettes.dark);
        state.settings = cfg.settings || state.settings;
        state.walls = (cfg.wallpapers || []).map((w) => ({ url: w.url, pos: w.pos || '' }));
        state.index = 0;
        paintInitial();
        const secs = Number(state.settings.cycleSeconds) || 0;
        if (state.walls.length > 1 && secs >= 5) {
          intervalDispose = timer.interval(() => { if (alive) advance(); }, secs * 1000);
        }
      } catch (err) { console.error('[chrono-archive] bootstrap failed', err && err.message); }
    })();
  },
};
