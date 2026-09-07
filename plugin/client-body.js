// Chrono Archive · Client 半区（镜像文件；与 cordis_define code.client 一致）v5
// - 深色：卡片/基底表面更实更暗（避免亮感贴字）
// - 设置页：新增「更换本机壁纸」路径输入 + 设为壁纸 / 恢复清单
const FALLBACK_LIGHT = { canvas: '#F1EBDB', base: '#EBE2CD', raised: '#F7F1E1', overlayBg: '#FDFAF0', ink: '#32291E', inkSoft: '#665B47', inkMuted: '#948871', accent: '#9B7830', accentSoft: '#BE9443', accentPale: '#E7CA7C', wine: '#8A4438', pine: '#52705A', slate: '#526173', link: '#4A5F86', success: '#55785A', warn: '#9A7A2E', danger: '#A3483C', codeBg: '#F5EEDD', codeBanner: '#EEE5CC', codeInline: '#FAF4E6', selection: '#DDC48E' };
const FALLBACK_DARK = { canvas: '#101319', base: '#161A22', raised: '#1D232D', overlayBg: '#1B212B', ink: '#EAE2CE', inkSoft: '#BCB39D', inkMuted: '#8F8673', accent: '#C9A24B', accentSoft: '#DFBE6E', accentPale: '#EAD08F', wine: '#A05244', pine: '#6E8D72', slate: '#7E93A8', link: '#A9BFE0', success: '#83A987', warn: '#D9AF5E', danger: '#C96B5B', codeBg: '#0F141C', codeBanner: '#171E29', codeInline: '#232B37', selection: '#8A6F2F' };
const BRIGHT_LIGHT = { canvas: '#F1EBDB', base: '#EBE2CD', raised: '#F7F1E1', overlayBg: '#FDFAF0', ink: '#32291E', inkSoft: '#665B47', inkMuted: '#948871', accent: '#9B7830', accentSoft: '#BE9443', accentPale: '#E7CA7C', wine: '#8A4438', pine: '#52705A', slate: '#526173', link: '#4A5F86', success: '#55785A', warn: '#9A7A2E', danger: '#A3483C', codeBg: '#F5EEDD', codeBanner: '#EEE5CC', codeInline: '#FAF4E6', selection: '#DDC48E' };
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
function mergePal(base, over) {
  const o = {};
  for (const k of Object.keys(base)) o[k] = (over && over[k] !== undefined) ? over[k] : base[k];
  for (const k of Object.keys(over || {})) if (!(k in base)) o[k] = over[k];
  return o;
}
function schemeTokens(p, cfg, dark) {
  const s = clamp(cfg.solidity, 0.3, 1);
  const baseAlpha = clamp(s * 0.8, 0.45, 0.96);
  const sidebarAlpha = clamp(s * 0.62, 0.3, 0.92);
  const layer1Alpha = clamp(s * 0.95, 0.6, 1);
  // 深色：基底/抬升面更实更暗，避免“亮卡片贴浅字”
  const darkBaseAlpha = clamp(0.42 + s * 0.6, 0.82, 0.97);
  const darkLayer1Alpha = clamp(0.8 + s * 0.2, 0.92, 0.98);
  const accentFill = dark ? p.accent : mix(p.accent, '#000000', 0.16);
  const accentHover = dark ? mix(p.accent, '#000000', 0.12) : mix(p.accent, '#000000', 0.3);
  const fgOnAccent = dark ? '#251D0B' : '#FDF6E4';
  const border = (a) => alpha(p.ink, a);
  const t = {};
  const put = (k, v) => { t[k] = v; };
  put('--dsw-alias-bg-base', alpha(p.base, dark ? darkBaseAlpha : baseAlpha));
  put('--dsw-alias-bg-layer-1', alpha(dark ? p.raised : mix(p.base, p.raised, 0.35), dark ? darkLayer1Alpha : layer1Alpha));
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
  put('--dsw-alias-label-caption', alpha(p.inkMuted, 0.96));
  put('--dsw-alias-label-dimmed', alpha(p.ink, 0.7));
  put('--dsw-alias-label-primary', p.ink);
  put('--dsw-alias-label-primary-bluish', p.ink);
  put('--dsw-alias-label-primary-dimmed', mix(p.ink, p.base, 0.3));
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
  const chroma = { '--chrono-canvas': p.canvas, '--chrono-base': p.base, '--chrono-raised': p.raised, '--chrono-overlay-bg': p.overlayBg, '--chrono-ink': p.ink, '--chrono-ink-soft': p.inkSoft, '--chrono-ink-muted': p.inkMuted, '--chrono-accent': accentFill, '--chrono-accent-soft': p.accentSoft, '--chrono-accent-pale': p.accentPale, '--chrono-wine': p.wine, '--chrono-pine': p.pine, '--chrono-slate': p.slate, '--chrono-link': p.link, '--chrono-success': p.success, '--chrono-warn': p.warn, '--chrono-danger': p.danger, '--chrono-code-bg': p.codeBg, '--chrono-code-banner': p.codeBanner, '--chrono-code-inline': p.codeInline, '--chrono-selection': p.selection };
  return Object.assign(t, chroma);
}
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
  return mergePal(base, over);
}
const RAIL_GOLD = '.pI_x6G_sidebarCol{--chrono-side-bg:rgba(13,14,19,.95);--chrono-side-gold:#C9A24B;--chrono-side-gold-bright:#E3C467;--chrono-side-ink:#F3E9D2;--dsw-alias-label-primary:var(--chrono-side-ink);--dsw-alias-label-primary-bluish:var(--chrono-side-ink);--dsw-alias-label-primary-dimmed:color-mix(in srgb,var(--chrono-side-ink) 64%,var(--chrono-side-gold) 36%);--dsw-alias-label-secondary:color-mix(in srgb,var(--chrono-side-ink) 72%,var(--chrono-side-gold) 28%);--dsw-alias-label-tertiary:color-mix(in srgb,var(--chrono-side-ink) 56%,var(--chrono-side-gold) 44%);--dsw-alias-label-caption:color-mix(in srgb,var(--chrono-side-ink) 48%,var(--chrono-side-gold) 52%);--dsw-alias-label-dimmed:color-mix(in srgb,var(--chrono-side-ink) 62%,transparent);--dsw-alias-border-l1:color-mix(in srgb,var(--chrono-side-gold) 18%,transparent);--dsw-alias-border-l2:color-mix(in srgb,var(--chrono-side-gold) 28%,transparent);--dsw-alias-border-l3:color-mix(in srgb,var(--chrono-side-gold) 42%,transparent);--dsw-alias-border-l4:color-mix(in srgb,var(--chrono-side-gold) 58%,transparent);--chrono-ink:var(--chrono-side-ink);--chrono-ink-soft:color-mix(in srgb,var(--chrono-side-ink) 72%,var(--chrono-side-gold) 28%);--chrono-ink-muted:color-mix(in srgb,var(--chrono-side-ink) 52%,var(--chrono-side-gold) 48%);--chrono-accent:var(--chrono-side-gold);--chrono-accent-soft:var(--chrono-side-gold-bright);--chrono-accent-pale:var(--chrono-side-gold-bright);--dsw-alias-interactive-bg-hover:color-mix(in srgb,var(--chrono-side-gold) 11%,transparent);--dsw-alias-interactive-bg-active:color-mix(in srgb,var(--chrono-side-gold) 19%,transparent);--dsw-specific-sidebar-nav-item-hover:color-mix(in srgb,var(--chrono-side-gold) 9%,transparent);--dsw-specific-sidebar-nav-item-active:color-mix(in srgb,var(--chrono-side-gold) 17%,transparent);--dsw-specific-sidebar-nav-item-active-accent:color-mix(in srgb,var(--chrono-side-gold) 27%,transparent);--dsw-specific-sidebar-fill:var(--chrono-side-bg);background:linear-gradient(180deg,color-mix(in srgb,var(--chrono-side-gold) 7%,transparent),transparent 96px),var(--chrono-side-bg);border-right-color:color-mix(in srgb,var(--chrono-side-gold) 46%,transparent)}.pI_x6G_sidebarCol{--dsw-alias-bg-base:rgba(26,29,36,.95);--dsw-alias-bg-layer-1:rgba(33,37,46,.96);--dsw-alias-bg-layer-2:#2a2f3a;--dsw-alias-bg-layer-3:#1c2029;--dsw-alias-bg-overlay:rgba(22,24,30,.97);--dsw-specific-menu:rgba(25,28,35,.97);--dsw-specific-selector:rgba(25,28,35,.97);--dsw-specific-input-major:#2a2f3a;--dsw-alias-button-tool-bar-fill:color-mix(in srgb,var(--chrono-side-gold) 9%,transparent);--dsw-alias-toast-bg:#1f242e;--dsw-alias-tooltip-bg:#1f242e}body[data-ds-dark-theme] .pI_x6G_sidebarCol{--chrono-side-bg:rgba(6,7,11,.92)}';
const PRESETS = {
  bright: { label: '亮纸 · Bright', desc: '高亮暖纸 · 黑金侧栏', rail: RAIL_GOLD, settings: { opacity: 0.68, blur: '0px', sat: 1.05, contrast: 1.0, solidity: 0.72 }, palLight: BRIGHT_LIGHT },
  paper:  { label: '旧纸 · Parchment', desc: '低曝旧纸 · 黑金侧栏', rail: RAIL_GOLD, settings: { opacity: 0.68, blur: '0px', sat: 1.05, contrast: 1.0, solidity: 0.72 }, palLight: {} },
  warm:   { label: '暖纸 · Warm', desc: '半透明暖侧栏', rail: '', settings: { opacity: 0.6, blur: '0px', sat: 1.02, contrast: 1.02, solidity: 0.76 }, palLight: {} },
  quiet:  { label: '安静 · Quiet', desc: '低干扰阅读', rail: '', settings: { opacity: 0.34, blur: '4px', sat: 0.95, contrast: 1.0, solidity: 0.9 }, palLight: {} },
};
const chronoUI = { current: 'bright', set: null, wallSet: null, wallClear: null, subs: [] };
chronoUI.notify = function () { for (const cb of this.subs.slice()) { try { cb(); } catch (_) {} } };
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
function ChronoPresetsRow() {
  const [, bump] = React.useState(0);
  const [pathVal, setPathVal] = React.useState('');
  const [wallMsg, setWallMsg] = React.useState('');
  React.useEffect(() => {
    const cb = () => bump((n) => n + 1);
    chronoUI.subs.push(cb);
    return () => { const i = chronoUI.subs.indexOf(cb); if (i >= 0) chronoUI.subs.splice(i, 1); };
  }, []);
  const names = Object.keys(PRESETS);
  const current = chronoUI.current;
  const active = PRESETS[current] || PRESETS.bright;
  const doSet = async () => {
    if (!chronoUI.wallSet) return;
    setWallMsg('…');
    const r = await chronoUI.wallSet(pathVal);
    setWallMsg(r && r.ok ? '✓ 已设为当前壁纸' : ('✗ ' + ((r && r.error) || '失败')));
  };
  const doClear = async () => {
    if (!chronoUI.wallClear) return;
    const r = await chronoUI.wallClear();
    setWallMsg(r && r.ok ? '✓ 已恢复默认壁纸集' : ('✗ ' + ((r && r.error) || '失败')));
  };
  return React.createElement('div', { className: 'chrono-preset-row' },
    React.createElement('span', { className: 'chrono-preset-title' }, 'CHRONO ARCHIVE · 时序档案馆 皮肤预设'),
    React.createElement('div', { className: 'chrono-preset-chips' },
      names.map((name) => React.createElement('button', {
        key: name,
        type: 'button',
        className: 'chrono-preset-chip',
        'data-active': String(name === current),
        onClick: () => { if (chronoUI.set) chronoUI.set(name); },
      }, PRESETS[name].label))),
    React.createElement('span', { className: 'chrono-preset-desc' }, active.desc + ' — 卸载插件即恢复默认外观'),
    React.createElement('span', { className: 'chrono-preset-title', style: { marginTop: 6 } }, '更换本机壁纸'),
    React.createElement('div', { className: 'chrono-wall-row' },
      React.createElement('input', {
        className: 'chrono-wall-input',
        type: 'text',
        placeholder: '粘贴图片绝对路径，如 F:\\…\\art\\wall.png',
        value: pathVal,
        onChange: (e) => setPathVal(e.target.value),
      }),
      React.createElement('button', { type: 'button', className: 'chrono-preset-chip', onClick: doSet }, '设为壁纸'),
      React.createElement('button', { type: 'button', className: 'chrono-preset-chip', onClick: doClear }, '恢复默认集')),
    React.createElement('span', { className: 'chrono-preset-desc' }, wallMsg || '路径需位于当前工作区（沙箱）；应用后立即生效并持久化'));
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
    let railDispose = null;
    let alive = true;
    let baseLight = FALLBACK_LIGHT;
    let baseDark = FALLBACK_DARK;
    let state = { preset: 'bright', paletteLight: FALLBACK_LIGHT, paletteDark: FALLBACK_DARK, settings: { pos: 'center 38%', size: 'cover', opacity: 0.68, blur: '0px', sat: 1.05, contrast: 1, cycleSeconds: 0, solidity: 0.72 }, walls: [], index: 0, visible: 'B', artA: '', artB: '', opA: 0, opB: 0 };
    function buildAllTokens() {
      const cfg = state.settings;
      const light = schemeTokens(state.paletteLight, cfg, false);
      const dark = schemeTokens(state.paletteDark, cfg, true);
      return composeOverrideMap(light, dark);
    }
    function insertRail(css) {
      try { if (railDispose) railDispose(); } catch (_) {}
      railDispose = null;
      if (css) { try { railDispose = styles.insert(css); } catch (_) {} }
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
      if (state.visible === 'A') { state.artB = urlOf(next); state.opA = 0; state.opB = op; state.visible = 'B'; }
      else { state.artA = urlOf(next); state.opB = 0; state.opA = op; state.visible = 'A'; }
      state.index = next;
      paint();
    }
    function applyWallList(list) {
      const walls = (list || []).map((w) => ({ url: w.url, pos: w.pos || '' }));
      state.walls = walls;
      state.index = 0;
      const op = String(state.settings.opacity);
      if (walls.length === 0) { state.artA = 'none'; state.artB = 'none'; state.opA = 0; state.opB = 0; state.visible = 'B'; }
      else if (walls.length === 1) { state.artA = 'none'; state.artB = urlOf(0); state.opA = 0; state.opB = op; state.visible = 'B'; }
      else paintInitial();
      paint();
    }
    function applyPreset(name) {
      const p = PRESETS[name] || PRESETS.bright;
      state.preset = name;
      state.settings = Object.assign({}, state.settings, p.settings);
      state.paletteLight = mergePal(baseLight, p.palLight || {});
      state.paletteDark = mergePal(baseDark, p.palDark || {});
      insertRail(p.rail);
      paint();
    }
    chronoUI.set = (name) => {
      if (!PRESETS[name]) return;
      if (chronoUI.current === name) return;
      chronoUI.current = name;
      try { applyPreset(name); } catch (err) { console.error('[chrono-archive] preset failed', err && err.message); }
      chronoUI.notify();
    };
    chronoUI.wallSet = async (path) => {
      try {
        const r = await host.call('chrono/wallpaper-set', { path: String(path || '') });
        if (r && r.ok && Array.isArray(r.wallpapers)) { applyWallList(r.wallpapers); chronoUI.notify(); return { ok: true }; }
        return { ok: false, error: (r && r.error) || 'failed' };
      } catch (e) { return { ok: false, error: (e && e.message) || String(e) }; }
    };
    chronoUI.wallClear = async () => {
      try {
        const r = await host.call('chrono/wallpaper-clear', {});
        if (r && r.ok && Array.isArray(r.wallpapers)) { applyWallList(r.wallpapers); chronoUI.notify(); return { ok: true }; }
        return { ok: false, error: (r && r.error) || 'failed' };
      } catch (e) { return { ok: false, error: (e && e.message) || String(e) }; }
    };
    insertRail(RAIL_GOLD);
    slots.inject('sidebar.brand.mark', () => slots.register({ name: 'sidebar.brand.mark' }, ChronoBrandMark));
    slots.inject('sidebar.brand.name', () => slots.register({ name: 'sidebar.brand.name' }, ChronoBrandName));
    slots.inject('conversation.hero.brand.mark', () => slots.register({ name: 'conversation.hero.brand.mark' }, HeroBrandMark));
    slots.inject('conversation.composer.dock', () => slots.register({ name: 'conversation.composer.dock', id: 'chrono-archive', order: 30 }, ChronoDock));
    slots.inject('shell.overlay', () => slots.register({ name: 'shell.overlay', id: 'chrono-archive', order: 90 }, ChronoAmbience));
    slots.inject('settings.general.item', () => slots.register({ name: 'settings.general.item', id: 'chrono-archive', order: 90 }, ChronoPresetsRow));
    ctx.effect(() => () => {
      alive = false;
      try { if (latestDispose) latestDispose(); } catch (_) {}
      try { if (intervalDispose) intervalDispose(); } catch (_) {}
      try { if (railDispose) railDispose(); } catch (_) {}
      chronoUI.subs = [];
    }, 'chrono-archive: lifecycle cleanup');
    (async () => {
      try {
        const cfg = await host.call('chrono/config', {});
        if (!cfg || !cfg.ok) return;
        const cssRes = await host.call('chrono/css', {});
        if (cssRes && cssRes.ok && cssRes.css) styles.insert(cssRes.css);
        baseLight = pickPalette('light', cfg.settings, cfg.palettes && cfg.palettes.light, {});
        baseDark = pickPalette('dark', cfg.settings, {}, cfg.palettes && cfg.palettes.dark);
        state.settings = cfg.settings || state.settings;
        state.walls = (cfg.wallpapers || []).map((w) => ({ url: w.url, pos: w.pos || '' }));
        state.index = 0;
        paintInitial();
        applyPreset(chronoUI.current);
        const secs = Number(state.settings.cycleSeconds) || 0;
        if (state.walls.length > 1 && secs >= 5) {
          intervalDispose = timer.interval(() => { if (alive) advance(); }, secs * 1000);
        }
      } catch (err) { console.error('[chrono-archive] bootstrap failed', err && err.message); }
    })();
  },
};
