window.__ModuleLoader__.load({
	id: "dsh-chrono-archive-theme",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		const React = require("react");
		console.log('[chrono-archive-theme] module factory loaded');
		const FALLBACK_LIGHT = { canvas: '#E6DBC2', base: '#DDD1B6', raised: '#EAE0C8', overlayBg: '#F3ECD9', ink: '#2E271C', inkSoft: '#4C4132', inkMuted: '#6B5E49', accent: '#967429', accentSoft: '#B78F3E', accentPale: '#D9BC72', wine: '#7E3F34', pine: '#4D6A54', slate: '#4F5E70', link: '#42577C', success: '#51744F', warn: '#8F6F28', danger: '#984439', codeBg: '#EDE2C9', codeBanner: '#E2D5B8', codeInline: '#F3EBD7', selection: '#D0B67A' };
		const FALLBACK_DARK = { canvas: '#101319', base: '#161A22', raised: '#1D232D', overlayBg: '#1B212B', ink: '#EAE2CE', inkSoft: '#C7BFA9', inkMuted: '#A49B86', accent: '#C9A24B', accentSoft: '#DFBE6E', accentPale: '#EAD08F', wine: '#A05244', pine: '#6E8D72', slate: '#7E93A8', link: '#A9BFE0', success: '#83A987', warn: '#D9AF5E', danger: '#C96B5B', codeBg: '#0F141C', codeBanner: '#171E29', codeInline: '#232B37', selection: '#8A6F2F' };
		const ARCH_PAPER = '#F6EED9';
		const ARCH_INK = '#251C0F';
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
			const darkBaseAlpha = clamp(0.42 + s * 0.6, 0.82, 0.97);
			const darkLayer1Alpha = clamp(0.8 + s * 0.2, 0.92, 0.98);
			const accentFill = dark ? p.accent : mix(p.accent, '#000000', 0.16);
			const accentHover = dark ? mix(p.accent, '#000000', 0.12) : mix(p.accent, '#000000', 0.3);
			const fgOnAccent = dark ? '#251D0B' : '#FDF6E4';
			const contrastFill = dark ? ARCH_PAPER : ARCH_INK;
			const contrastText = dark ? ARCH_INK : ARCH_PAPER;
			const border = (a) => alpha(p.ink, a);
			const t = {};
			const put = (k, v) => { t[k] = v; };
			put('--dsw-alias-bg-base', alpha(p.base, dark ? darkBaseAlpha : baseAlpha));
			put('--dsw-alias-bg-layer-1', alpha(dark ? p.raised : mix(p.base, p.raised, 0.35), dark ? darkLayer1Alpha : layer1Alpha));
			put('--dsw-alias-bg-layer-2', p.raised);
			put('--dsw-alias-bg-layer-3', dark ? mix(p.raised, '#000000', 0.25) : p.raised);
			put('--dsw-alias-bg-overlay', alpha(p.overlayBg, 0.985));
			put('--dsw-alias-bg-module-platform', p.canvas);
			put('--dsw-alias-bg-mask-1', alpha(p.ink, 0.16));
			put('--dsw-alias-bg-mask-2', alpha(p.ink, 0.3));
			put('--dsw-alias-bg-mask-3', alpha(p.ink, 0.46));
			put('--dsw-alias-bg-mask-drop', alpha(p.ink, 0.5));
			put('--dsw-alias-bg-mask-photo', alpha(p.canvas, 0.45));
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
			put('--dsw-alias-button-contrast-fill', contrastFill);
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
			put('--dsw-alias-label-primary-inverted', contrastText);
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
			const map = {};
			for (const name of Object.keys(lightTokens)) {
				const darkValue = darkTokens[name] !== undefined ? darkTokens[name] : lightTokens[name];
				map[name] = { light: lightTokens[name], dark: darkValue };
			}
			return map;
		}
		const RAIL_GOLD = '.pI_x6G_sidebarCol{--chrono-rail-bg:rgba(11,12,17,.97);--chrono-rail-surface:#232833;--chrono-rail-elevated:#2E3542;--chrono-rail-floating:rgba(30,34,42,.985);--chrono-rail-hover:rgba(201,162,75,.11);--chrono-rail-active:rgba(201,162,75,.22);--chrono-rail-ink:#F3EAD5;--chrono-rail-ink2:#CEC1A1;--chrono-rail-ink3:#A79877;--chrono-rail-gold:#C9A24B;--chrono-rail-gold-bright:#E3C467;--chrono-rail-contrast-fill:#E9DDBB;--chrono-rail-contrast-text:#241C0F;--dsw-alias-bg-base:var(--chrono-rail-bg);--dsw-alias-bg-layer-1:var(--chrono-rail-surface);--dsw-alias-bg-layer-2:var(--chrono-rail-elevated);--dsw-alias-bg-layer-3:color-mix(in srgb,var(--chrono-rail-elevated) 78%,#000);--dsw-alias-bg-layer-4:var(--chrono-rail-elevated);--dsw-alias-bg-module-platform:var(--chrono-rail-surface);--dsw-alias-bg-overlay:var(--chrono-rail-floating);--dsw-alias-button-contrast-fill:var(--chrono-rail-contrast-fill);--dsw-alias-button-elevated-fill:var(--chrono-rail-elevated);--dsw-alias-button-floating-fill:var(--chrono-rail-floating);--dsw-alias-button-floating-hover:color-mix(in srgb,var(--chrono-rail-gold) 12%,var(--chrono-rail-elevated));--dsw-alias-button-ghost-active-fill:rgba(255,255,255,.05);--dsw-alias-button-ghost-active-hover:color-mix(in srgb,var(--chrono-rail-gold) 13%,transparent);--dsw-alias-button-tool-bar-fill:rgba(255,255,255,.04);--dsw-alias-button-tool-bar-hover:var(--chrono-rail-hover);--dsw-alias-interactive-bg-hover:var(--chrono-rail-hover);--dsw-alias-interactive-bg-active:var(--chrono-rail-active);--dsw-alias-interactive-bg-hover-solid:rgba(255,255,255,.07);--dsw-alias-label-primary:var(--chrono-rail-ink);--dsw-alias-label-primary-bluish:var(--chrono-rail-ink);--dsw-alias-label-primary-dimmed:color-mix(in srgb,var(--chrono-rail-ink) 62%,var(--chrono-rail-gold) 38%);--dsw-alias-label-primary-inverted:var(--chrono-rail-contrast-text);--dsw-alias-label-secondary:var(--chrono-rail-ink2);--dsw-alias-label-tertiary:var(--chrono-rail-ink3);--dsw-alias-label-caption:var(--chrono-rail-ink3);--dsw-alias-label-dimmed:color-mix(in srgb,var(--chrono-rail-ink) 64%,transparent);--dsw-alias-border-l1:color-mix(in srgb,var(--chrono-rail-gold) 18%,transparent);--dsw-alias-border-l2:color-mix(in srgb,var(--chrono-rail-gold) 28%,transparent);--dsw-alias-border-l3:color-mix(in srgb,var(--chrono-rail-gold) 44%,transparent);--dsw-alias-border-l4:color-mix(in srgb,var(--chrono-rail-gold) 60%,transparent);--dsw-specific-menu:var(--chrono-rail-floating);--dsw-specific-selector:var(--chrono-rail-floating);--dsw-specific-input-major:#2A303B;--dsw-specific-sidebar-fill:var(--chrono-rail-bg);--dsw-specific-sidebar-nav-item-active:color-mix(in srgb,var(--chrono-rail-gold) 16%,transparent);--dsw-specific-sidebar-nav-item-active-accent:color-mix(in srgb,var(--chrono-rail-gold) 28%,transparent);--dsw-specific-sidebar-nav-item-hover:var(--chrono-rail-hover);--dsw-specific-tip:var(--chrono-rail-surface);--dsw-specific-bubble:var(--chrono-rail-surface);--dsw-alias-toast-bg:var(--chrono-rail-floating);--dsw-alias-tooltip-bg:var(--chrono-rail-floating);--chrono-ink:var(--chrono-rail-ink);--chrono-ink-soft:var(--chrono-rail-ink2);--chrono-ink-muted:var(--chrono-rail-ink3);--chrono-accent:var(--chrono-rail-gold);--chrono-accent-soft:var(--chrono-rail-gold-bright);--chrono-accent-pale:var(--chrono-rail-gold-bright);background:linear-gradient(180deg,color-mix(in srgb,var(--chrono-rail-gold) 6%,transparent),transparent 96px),var(--chrono-rail-bg);border-right-color:color-mix(in srgb,var(--chrono-rail-gold) 44%,transparent)}body[data-ds-dark-theme] .pI_x6G_sidebarCol{--chrono-rail-bg:rgba(6,7,11,.95);--chrono-rail-surface:#1D222C;--chrono-rail-elevated:#262C38}';
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
		function insertStyle(css) {
			if (!css) return null;
			const tag = document.createElement('style');
			tag.dataset.plugin = 'chrono-archive-theme';
			tag.textContent = css;
			document.head.appendChild(tag);
			return () => { try { tag.remove(); } catch (_) {} };
		}
		async function apply(ctx) {
			console.log('[chrono-archive-theme] apply called');
			await new Promise((resolveInject) => { try { ctx.inject(['slots', 'theme', 'timer'], () => resolveInject()); } catch (_) { resolveInject(); } });
			const slots = ctx.get('slots');
			const theme = ctx.get('theme');
			const timer = ctx.get('timer');
			console.log('[chrono-archive-theme] services ready', { s: !!slots, t: !!theme, ti: !!timer });
			if (slots === undefined || theme === undefined || timer === undefined) { console.error('[chrono-archive-theme] missing services'); return; }
			let latestDispose = null;
			let intervalDispose = null;
			let alive = true;
			let baseLight = FALLBACK_LIGHT;
			let baseDark = FALLBACK_DARK;
			let settings = { pos: 'center 38%', size: 'cover', opacity: 0.68, blur: '0px', sat: 1.05, contrast: 1, cycleSeconds: 0, solidity: 0.72 };
			let walls = [];
			let index = 0;
			let visible = 'B';
			let artA = '';
			let artB = '';
			let opA = 0;
			let opB = 0;
			const styleCleanups = [];
			function paint() {
				if (!alive || theme === undefined) return;
				const pos = walls[index] && walls[index].pos ? walls[index].pos : settings.pos;
				const artExtra = {
					'--chrono-art-a': artA, '--chrono-art-b': artB,
					'--chrono-op-a': String(opA), '--chrono-op-b': String(opB),
					'--chrono-pos': pos, '--chrono-bg-size': settings.size,
					'--chrono-blur': settings.blur, '--chrono-sat': String(settings.sat), '--chrono-contrast': String(settings.contrast),
				};
				const map = composeOverrideMap(schemeTokens(baseLight, settings, false), schemeTokens(baseDark, settings, true));
				for (const k of Object.keys(artExtra)) map[k] = { light: artExtra[k], dark: artExtra[k] };
				try { latestDispose = theme.overrideTokens('chrono-archive', map); } catch (_) {}
			}
			const urlOf = (i) => (walls.length ? 'url("' + walls[i % walls.length].url + '")' : 'none');
			function layoutArt() {
				const n = walls.length;
				const op = String(settings.opacity);
				if (n === 0) { artA = 'none'; artB = 'none'; opA = 0; opB = 0; visible = 'B'; }
				else if (n === 1) { artA = 'none'; artB = urlOf(0); opA = 0; opB = op; visible = 'B'; }
				else { artA = urlOf(0); artB = urlOf(1); opA = op; opB = 0; visible = 'A'; }
				index = 0;
				paint();
			}
			function advance() {
				if (walls.length < 2) return;
				const next = (index + 1) % walls.length;
				const op = String(settings.opacity);
				if (visible === 'A') { artB = urlOf(next); opA = 0; opB = op; visible = 'B'; }
				else { artA = urlOf(next); opB = 0; opA = op; visible = 'A'; }
				index = next;
				paint();
			}
			slots.inject('sidebar.brand.mark', () => slots.register({ name: 'sidebar.brand.mark' }, ChronoBrandMark));
			slots.inject('sidebar.brand.name', () => slots.register({ name: 'sidebar.brand.name' }, ChronoBrandName));
			slots.inject('conversation.composer.dock', () => slots.register({ name: 'conversation.composer.dock', id: 'chrono-archive', order: 30 }, ChronoDock));
			slots.inject('shell.overlay', () => slots.register({ name: 'shell.overlay', id: 'chrono-archive', order: 90 }, ChronoAmbience));
			styleCleanups.push(insertStyle(RAIL_GOLD));
			// 立即按内置调色板应用一次（不等异步配置），保证默认即有主题
			try {
				latestDispose = theme.overrideTokens('chrono-archive', composeOverrideMap(schemeTokens(baseLight, settings, false), schemeTokens(baseDark, settings, true)));
				console.log('[chrono-archive-theme] default tokens applied');
			} catch (e) { console.error('[chrono-archive-theme] default apply failed', e && e.message); }
			ctx.effect(() => () => {
				alive = false;
				try { if (latestDispose) latestDispose(); } catch (_) {}
				try { if (intervalDispose) intervalDispose(); } catch (_) {}
				for (const c of styleCleanups) { try { c(); } catch (_) {} }
			}, 'chrono-archive-theme: cleanup');
			try {
				const res = await fetch('/chrono-config.json', { cache: 'no-store' });
				if (!res.ok) return;
				const cfg = await res.json();
				if (!cfg || !cfg.ok) return;
				const skinCleanup = insertStyle(cfg.css || '');
				if (skinCleanup) styleCleanups.push(skinCleanup);
				baseLight = mergePal(FALLBACK_LIGHT, cfg.palettes && cfg.palettes.light);
				baseDark = mergePal(FALLBACK_DARK, cfg.palettes && cfg.palettes.dark);
				settings = Object.assign(settings, cfg.settings);
				walls = (cfg.wallpapers || []).map((w) => ({ url: w.url, pos: w.pos || '' }));
				layoutArt();
				const secs = Number(settings.cycleSeconds) || 0;
				if (walls.length > 1 && secs >= 5 && timer) {
					intervalDispose = timer.interval(() => { if (alive) advance(); }, secs * 1000);
				}
			} catch (e) { console.error('[chrono-archive-theme] bootstrap failed', e && e.message); }
		}
		exports.apply = apply;
		exports.inject = [];
		return module.exports;
	}
});
