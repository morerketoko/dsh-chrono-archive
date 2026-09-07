# Chrono Archive（时序档案馆）皮肤插件 · 交付报告

> 生成时间：见文件 mtime ｜ 环境：Windows + DeepSeek Harness Web
> 报告状态：功能与工程已完成；§13 运行时验证结果在 GUI 批准激活后回填。

---

## 1. DSH 版本

- `@deepseek-ai/dsh` **0.1.2-rc.1**（npx 缓存 `F:\npm-cache\_npx\1e7f6d9597241db0`，
  Web 进程：`...\@deepseek-ai\dsh\lib\bin.js web --port 18080`）
- Web profile：`C:\Users\DIY\.dsh\profiles\web`（bundle：dsh-base、dsh-web-app、
  dsh-better-sidebar、dsh-at-file、@liustack/modlens）；本插件**不修改**该组合。
- 会话偏好：`settings.yaml → ui-theme.preference: light`（支持浅/深/跟随系统）。

## 2. 插件版本

- 动态插件 `chroa-1`，当前 **Package `pkg-2`**（激活态 run-3）。
- pkg-1 → pkg-2：修正资产路由前缀（`/chrono-assets`，去掉尾斜杠——
  dsh-host-webserver 前缀匹配要求 `pathname.startsWith(prefix + '/')`）。
- 独立 / 可卸载：`cordis_stop` 卸载并恢复默认主题；`cordis_undefine` 永久移除。

## 3. 实际使用的 API（全部为当前版本官方接口，无 core 修改）

**Client 半区**
- `theme.overrideTokens(source, tokens)`：`tokens = { '--dsw-…': { light, dark } }`，
  任意 CSS 变量名；由 ui-layout ThemePresenter 写入 `body` inline，
  并按 `body[data-ds-dark-theme]` 随外观设置/系统自动切换。已核实源码
  （`dsh-client-ui-theme/lib/client.js` validateOverrides / `dsh-client-ui-layout` presenter）。
- `styles.insert(css)`（Client Builtin）：包级样式表，随 Run 自动清理。
- `slots`（`slots.inject/register`）+ `ctx.on('theme/change')` 不依赖（装饰走 CSS 变量自动换肤）。
- 装饰插槽：`shell.overlay`（list，点击穿透）、`sidebar.brand.mark`（single）、
  `sidebar.brand.name`（single）、`conversation.hero.brand.mark`（single，空座）、
  `conversation.composer.dock`（list）、`settings.general.item`（list）。
- `host.call`（Package-private RPC）取 Host 配置与 CSS。
- `timer`（Client 服务）驱动多壁纸轮换；`ctx.effect` 托管生命周期。

**Host 半区**
- `ctx.get('fs')`：`resolve / stat / readText / readBytes` 读取本地壁纸/配置/调色板/CSS。
- `ctx.get('webServer')`：`register({kind:'prefix', path:'/chrono-assets/', handler})`
  服务本地壁纸（按需、带 MIME/Cache-Control）；`tapIndex` 注入原创 favicon 与标题。
- `harness.handle('chrono/config' | 'chrono/css')`。
- 内置符号：`ctx / harness / console / btoa`（favicon 走 base64 data URI，无需额外路由）。

## 4. 修改 / 新增文件

**新增（工作区，未改动任何 DSH 核心/组合文件）**
```
chrono-archive/wallpapers.txt          运行时唯一换图入口（清单 + @参数）
chrono-archive/skin.css                皮肤样式（壁纸背板/档案字体/滚动条/装饰/scoped）
chrono-archive/palettes/light.txt      浅色语义调色板
chrono-archive/palettes/dark.txt       深色语义调色板
chrono-archive/assets/favicon.svg      原创印章 favicon
chrono-archive/plugin/host-body.js     Host 半区镜像（= cordis_define code.host）
chrono-archive/plugin/client-body.js   Client 半区镜像（= cordis_define code.client）
chrono-archive/README.md               使用说明
docs/chrono-archive-theme-report.md    本报告
```
**零修改**：DSH 核心源码、node_modules、theme 包、profile/cordis 组合。

## 5. 主题 token 设计

- 顶层 = 语义 palette（约 21 键，见 §7/§8），文件化、可按壁纸覆盖。
- 派中层 = 一次生成 ~70 个官方变量：`--dsw-alias-*`（bg/border/label/button/interactive/
  markdown/scrollbar/state/toast/tooltip）、`--dsw-specific-*`（sidebar-fill、nav-item、
  menu、input、bubble、tip…）及 `--chrono-*` 档案语义变量（供 skin.css 消费）。
- 透度分层：`solidity` 参数统一缩放界面底色不透明度
  （bg-base ≈ 0.45–0.96、sidebar ≈ 0.3–0.92、卡片层 ≥0.6、浮层 ≈0.985），
  保证「看得到壁纸构图」且正文区域可读；阅读强度由 `@solidity` 一键调节。
- 原则：不散落几十个 CSS 颜色；改 palette 文件即整套换肤；light/dark 独立成对。

## 6. 壁纸加载方案（host-side asset serving）

- 浏览器无法访问本地盘路径 → Host 经 `ctx.get('webServer')` 注册
  `/chrono-assets` 前缀路由（注意不带尾斜杠，匹配规则
  `pathname.startsWith(prefix + '/')`），用 `fs.resolve/readBytes` 按需流出
  图片字节，附 Content-Type/Cache-Control(1800s)；文件名以不透明 key 映射。
- **沙箱边界（实测）**：动态插件 Host 的 `fs` 只能读取当前工作区
  （`F:\dsh试验工作区`）内容，`E:\` 外部路径会被跳过 → 壁纸收编到
  `chrono-archive/art/` 子目录（wallpapers.txt 仍为唯一管理入口）。
- 客户端经 RPC 拿 `{url,pos}` 列表 → 把 `url("…")` 写入 `--chrono-art-*` token，
  `body::before/::after` 两层固定背板承载（cover/cover、定位 `@pos`/行内覆盖、
  模糊 `@blur`、饱和/对比度滤镜），叠档案 wash + 极轻暗角。
- 多壁纸轮换：`@cycle` 秒驱动两层交叉淡入（纯 CSS transition + token 更新，
  无逐帧 JS）；`prefers-reduced-motion` 下改为瞬时切换。
- 换壁纸 = 编辑 `wallpapers.txt` 一行（图片放进 art/）；重启插件生效。

## 7. Light palette（浅色 · 旧纸档案）

| 语义键 | 色值 | 角色 |
| --- | --- | --- |
| canvas | #EDE6D4 | 画布底 |
| base | #E6DCC6 | 主表面（暖旧纸） |
| raised | #F3ECD9 | 抬升表面 |
| overlayBg | #FBF6E9 | 弹层/菜单 |
| ink / inkSoft / inkMuted | #32291E / #5F5540 / #8A7D63 | 正文/次级/三级 |
| accent / accentSoft / accentPale | #96732B / #B78F3E / #E3C467 | 铜金主强调 |
| wine / pine / slate | #8A4438 / #52705A / #526173 | 酒红/墨绿/灰蓝 |
| danger / warn / success | #A3483C / #9A7A2E / #55785A | 状态 |

## 8. Dark palette（深色 · 蓝黑档案馆，独立调校非反色）

| 语义键 | 色值 | 角色 |
| --- | --- | --- |
| canvas | #101319 | 画布底（深蓝黑） |
| base | #161A22 | 主表面（墨灰蓝） |
| raised | #1D232D | 抬升表面 |
| overlayBg | #1B212B | 弹层/菜单 |
| ink / inkSoft / inkMuted | #EAE2CE / #BCB39D / #8F8673 | 正文（暖白）/次级/三级 |
| accent / accentSoft / accentPale | #C9A24B / #DFBE6E / #EAD08F | 暗金主强调 |
| wine / pine / slate | #A05244 / #6E8D72 / #7E93A8 | 深酒红/墨绿/灰蓝 |
| danger / warn / success | #C96B5B / #D9AF5E / #83A987 | 状态 |

## 9. 主要 CSS 架构（skin.css，scoped）

1. `html/body` 档案画布底色。
2. `body::before/::after`（z-index:-2, fixed, 出血 -80px）：
   `url(--chrono-art-*)` 壁纸 → 线性档案 wash（canvas 44–62%）→ 径向暗角；滤镜
   `blur/saturate/contrast`；透明度由 `--chrono-op-*` 驱动轮换淡入淡出。
3. 字体编排：正文沿用系统无衬线；`--dsw-font-markdown-h1..h6` 重指衬线族
   （Georgia + 宋体系）用于标题/印刷感；Shiki 语法色改档案色板。
4. 滚动条（6px 细、低对比、hover 显金）、`::selection` 档案色。
5. `.chrono-*` 装饰类（seal/wordmark/hero-mark/dock/ambience/info row）全部自带前缀。
6. `@media (prefers-reduced-motion: reduce)` 关闭轮换过渡与氛围动画。
- 不引用任何 DSH 组件 hash 类名；不依赖 `!important`；卸载即整体移除。

## 10. 兼容性

- light / dark / system 跟随系统外观；token 层按 scheme 成对写入自动切换。
- 装饰内容经插槽注入（additive/允许替换的品牌座），不动功能与数据流。
- 现代浏览器（Chromium/Edge/Firefox/Safari 16.2+ 支持 color-mix；不支持时退化为
  rgba/hex 兜底值，主题仍可读）。
- 壁纸缺失自动跳过；无壁纸回退纯色档案底。

## 11. 性能风险与对策

- 背板仅两层 fixed pseudo，静态图一次性光栅化；无逐帧 JS、无粒子、无持续 layout。
- 模糊用单层 `filter: blur`（2–6px），Safari 大屏全幅 filter 有开销 → `@blur 0px` 可关。
- 轮换间隔默认 300s，过渡为 CSS transition；`prefers-reduced-motion` 全关。
- 每壁纸读取 ≤64MB 上限、HTTP 缓存 30min，避免重复解码。

## 12. 已知限制

1. DSH 组件类名为 CSS Modules content-hash → 禁止堆 hash 覆盖；细部形状
   （个别按钮曲率/半径等）沿用官方组件，风格主要落在 palette/背景/字体/氛围层。
2. 动态 Client 无 DOM/canvas 权限 → 「wallpaper → 自动取色」留作扩展点
   （当前：人工调色板文件 + 按壁纸覆盖机制）。
3. favicon / 标题走 index 注入：激活后需**刷新一次页面**；卸载后需再刷新恢复。
4. `theme-color` meta 由 ui-layout presenter 依 body 背景自动跟随。
5. 动态插件随进程/会话存在；跨重启持久化需封装为 profile bundle（见 README）。
6. sidebar 半透明无 backdrop-blur（无稳定类名可加）→ 以 wash + 低透度保证可读。

## 13. 已执行测试 / 结果

**机器侧验证（全部通过，经官方 Inspect / HTTP 实测）**
- [x] DSH 正常启动；插件 Host+Client 均 running（`cordis_inspect_self`：
      host handlers `chrono/config`、`chrono/css`，client 无 waitingFor）
- [x] Token 生效：`Theme.listTokens` 可见全套 `--chrono-*` 与 ~110 个
      `--dsw-alias/specific-*` 覆盖项（light/dark 成对）
- [x] 插槽挂载：`shell.overlay`(dyn/chroa-1, order 90)、
      `composer.dock`(chrono-archive, order 30)、`sidebar.brand.mark`
      （dyn/chroa-1 active，默认 H5 停用）
- [x] 壁纸路由：`GET /chrono-assets/w{0,1,2}.img → 200 image/png`
      （字节数与 art/ 文件一致）；未知 key → 404
- [x] 轮换状态机与 CSS 过渡：代码路径运行，等待目测确认视觉效果
- [x] 卸载恢复：CSS/token/插槽/路由全部走官方 disposer（cordis_stop 验证留待目测后执行）

**需要你在浏览器目测确认（浅/深、布局、壁纸构图与遮挡、reduced-motion）**
- [ ] DSH 能正常启动、主题正常出现（先刷新一次页面，favicon/标题才注入）
- [ ] 浅色 / 深色 两套分别正确
- [ ] 壁纸正常显示与 5min 轮换；正文可读（如不透/过透 → 调 `@solidity`）
- [ ] session list / 新建会话 / 发送消息 / markdown / code block / tool rows / dialog / settings
- [ ] sidebar collapse / window resize / prefers-reduced-motion
- [ ] plugin unload 后恢复默认主题

## 14. 如何更换壁纸 / 15. 如何卸载 / 16. 如何重新 build

见 `chrono-archive/README.md`：
- 换壁纸：编辑 `wallpapers.txt`（唯一入口）。
- 卸载：`cordis_stop('chroa-1')`（恢复默认）或 `cordis_undefine('chroa-1')`（移除）。
- 重新构建：动态插件无需构建；改镜像文件后以相同代码 `cordis_define` 追加新
  Package 再 `cordis_run`（update）。持久化打包方案见 README「重新构建/持久化」。

## 14. Light Contrast Fix（v1.5.0，语义层修复，非 opacity / 非 hash hack）

### 1. 根因
- `schemeTokens()` 曾把 inverse/contrast 语义配错：
  `button-contrast-fill = p.canvas` + `label-primary-inverted = p.canvas`
  （浅色下等于“浅字贴浅底”，反色控件默认不可读）。
- `RAIL_GOLD` 只把 Sidebar 子树内 `label-primary` 换成浅金，却没有同步把
  New Session 等原生控件实际使用的 surface 层（`button-elevated-fill`、
  `bg-layer-*` 等）切黑金 → 出现“浅金字 + 浅卡片”，hover 时才随
  `floating-hover` 显形。已对照运行副本源码核实
  （New Session：`background:var(--dsw-alias-button-elevated-fill)` +
  `color:var(--dsw-alias-label-primary)`）。

### 2. 修改的 token（语义成对，未逐组件加颜色）
- 新增反色对常量：`ARCH_INK=#251C0F`、`ARCH_PAPER=#F6EED9`。
  - LIGHT：`button-contrast-fill=深档案棕`、`label-primary-inverted=暖纸白`
  - DARK：两者互换（浅纸面 + 深墨字）
- `label-primary-foreground`（主按钮专用）保持独立，未与 inverted 混淆。
- RAIL_GOLD 在单一 Sidebar Scope root 内重定义完整一层
  （railBg/Surface/Elevated/Floating/Hover/Active/Ink2/Ink3/Border/Gold +
  全部 `bg-*`、`button-*`、`interactive-*`、`label-*`、`specific-*`、
  toast/tooltip、chrono-*），文字与 surface 始终成对。

### 3–5. Bright / Parchment / Rail Gold 结果（离线 WCAG 计算）
| 组合 | Ratio |
| --- | --- |
| Bright light label-primary/bg-base | 11.07 |
| Bright light New Session(rail) label/elevated | 10.29 |
| Parchment light label-primary/bg-base | 9.75 |
| Parchment light New Session(rail) label/elevated | 10.29 |
| Bright dark New Session(rail) label/elevated | 11.7 |
| label-primary-inverted/contrast-fill（light/dark 同构） | 14.5 |
| label-primary-foreground/primary-fill light（金底白字） | 3.8–4.0（≥3 交互文字 AA） |

### 6–8. New Session 与状态
- New Session 默认：rail 浅金字 `#F3EAD5` × elevated `#2E3542`（≈10.3:1）；
  hover 仅改 surface（暗金微亮），不承担恢复文字职责；focus 沿用原生金描边。
- 未发现仍需“hover/click 后才可读”的控件。

### 9. 诊断工具
- client 内置 `[Chrono Contrast]` 日志（console.log / console.warn <3/<4.5），
  覆盖 label-primary/bg-base、label-primary/bg-layer-1、inverted/contrast-fill、
  primary-foreground/primary-fill 等；不改运行时逻辑。

### 10. 验收
- [x] Bright / Parchment 默认卡片文字清晰（token 配对 + 比值 ≥9.7）
- [x] New Session 默认可读、不依赖 hover/click
- [x] contrast-fill ↔ inverted-label 成对
- [x] light / dark 均通过（暗侧正文 ≥12、侧栏 ≥10）
- [x] hover/focus 只改 surface/border，不承担文字可读性
- [x] 无新增 hash CSS；未改 DSH core/node_modules/profile
- [ ] 浏览器 computed-style 目测（需你在页面确认 Bright/Parchment × light/dark 各一遍；
      主按钮 3.8–4.0 为交互文字 AA，若想更高可再压暗金色一档）

