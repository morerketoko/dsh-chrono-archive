# dsh-better-sidebar · Right-panel width drag dead — upstream report

> 用途：提交给 `omdsh-dev/DSH-better-sidebar` 上游的复现报告。
> 结论：右栏 **左边缘宽度拖动**（`panelResize` strip）在当前环境完全无效——鼠标移到左边缘无 `col-resize`/拖动无反应，宽度不变化。官方 npm **0.18.0** 与上游 **master（6fbfeed，2026-09-07，含 PR #499 前全部修复）** 均复现；与皮肤插件、DSH 中其他 Web 插件**无关**（已逐层隔离证明）。

---

## 1. 环境

| 项 | 值 |
|---|---|
| OS | Windows 11 专业版（64 位） |
| DSH CLI | `@deepseek-ai/dsh` `0.1.2-rc.1`（npm `latest`），`dsh web` 运行 |
| Web profile | 官方 `dsh plugin --profile web` 布局；`pnpm` 9.15.9 |
| better-sidebar (A) | npm `dsh-better-sidebar@0.18.0`（sha512 `6sGUIpgrFLXikACKBXLSiyngULceZCIr5M4bLw2IdCJ3KWHcbNsJJl+TLHJw0lM9voRw0etbr5fC16VQ9YvshQ==`） |
| better-sidebar (B) | GitHub master `6fbfeedc0189e95a1c4d3908d3a58c784c5b7f15`（本地 tsdown 构建，宿主 import 验证通过后加载） |
| 浏览器 | Google Chrome `152.0.7977.65`（同时装有 Edge `152.0.4191.66`） |
| 观察到的浏览器扩展 | Grammarly、Chrome Built-In AI（LanguageDetector）在 Console 有注入噪音；未做禁用测试（见 §5） |

---

## 2. 现象与复现步骤

1. 展开右侧栏（Git/文件等任一标签）。
2. 鼠标移到右栏**最左边缘**的 resize strip（约 8px 命中区，`cursor: col-resize`）。
3. 按住左键左右拖动。

结果：
- 光标不出现 `col-resize`（或出现后拖动无任何宽度变化）；
- `panelResize` 的宽度完全不更新；
- 底部栏上边缘、标签拖成浮窗等其他拖动手势同样无效（“完全不能拖”）。
- 无任何 better-sidebar / DSH 的 JS 报错（Console 干净，只有扩展噪音）。

已尝试但无效：
- `?dsh-sidebar-reset`（官方 #369 逃生口，清 localStorage 布局快照与宽度键）；
- 重装官方 0.18.0、装 master 本地构建版。

---

## 3. 隔离测试矩阵（全部在 DSH 0.1.2-rc.1 上实测）

| 组合 | 右栏拖动结果 |
|---|---|
| 默认 DSH（无任何第三方 Web 插件） | —（无面板可测） |
| 仅 better-sidebar 0.18.0（chrono/at-file/modlens 全部从 bundles 摘除） | **仍不能拖** |
| better-sidebar 0.18.0 + chrono-archive 主题 | 不能拖 |
| better-sidebar 0.18.0 + chrono-archive（主题完整卸载后） | **仍不能拖** |
| better-sidebar master 6fbfeed + 完整插件组 | **仍不能拖** |

chrono-archive 主题还额外做了“最小实验”：
- 主题玻璃功能原在结构性 center column 上施加 `backdrop-filter`；
- 已按“视觉层与结构层分离”原则彻底移除结构列上的 backdrop-filter（`backdrop-filter: none` 默认态，见 chrono commit `58b664f`）；
- 拖动依旧无效 → 可排除 center-column compositing/stacking 干扰 hypothesis。

结论：**与任何皮肤/其他插件无关，是 better-sidebar 与 DSH 0.1.2-rc.1（或浏览器/系统层）的兼容问题，官方 0.18.0 与最新 master 均未解决。**

---

## 4. 给上游定位的线索

- resize strip 命中区非常薄（`left:-4px; width:8px; z-index:2`），且其宿主层 `[data-dsh-panel-host]` 为 `pointer-events:none; position:fixed; inset:0`，仅子节点开 pointer events —— 请核对在 DSH web 0.1.2-rc.1 的真实 DOM 结构下，该 strip 是否会被任何**同层或上层元素**（尤其 DSH 自身布局容器）覆盖/穿透。
- 建议上游在**干净 Chrome（无扩展）+ 仅 better-sidebar** 的 DSH rc.1 下复现；复现时在 Console 执行下方脚本，把 `elementFromPoint` 结果发回（预期命中 handle 本身）。
- 若干净环境不可复现 → 强烈怀疑浏览器扩展（本机 Console 有 Grammarly / Chrome Built-In AI 注入；扩展会改 pointer/drag 行为）。报告人环境中 Edge/隐身测试被 DSH 的 auth 拦截，尚未完成扩展排除（见 §5）。

诊断脚本（已在报告人环境可用，暴露为 `window.__chronoDiagnoseSidebarResizeHit()`）：

```js
const panel = document.querySelector('[data-dsh-better-sidebar] [data-dsh-panel]');
if (!panel) { console.warn('panel not found'); }
const handle = [...panel.querySelectorAll('*')].find(el => getComputedStyle(el).cursor === 'col-resize');
const rect = handle.getBoundingClientRect();
const x = rect.left + rect.width / 2;
const y = rect.top + Math.min(rect.height / 2, window.innerHeight / 2);
const hit = document.elementFromPoint(x, y);
console.log({ handle, rect, hit, hitClass: hit?.className, hitCursor: hit ? getComputedStyle(hit).cursor : null });
```

---

## 5. 未排除变量（请求报告人/维护者补充）

1. **浏览器扩展**：Console 中可见 Grammarly、Chrome Built-In AI 活动；曾尝试 Edge/隐身窗口验证，但 DSH 要求 auth token（“reopen the URL printed by dsh web”），未完成。**建议报告人先用正常登录的 Chrome 关闭全部扩展后重测**（1 分钟，无需重启服务），结果可显著收窄范围。
2. 触控/指针设备特性（本机为普通鼠标，未见异常）。

---

## 6. 其他备注

- 报告人 profile 中还同时装有 `dsh-at-file`、`@liustack/modlens`、chrono-archive 皮肤，均已在 §3 逐层排除。
- 现象在 better-sidebar **旧版即可拖、当前不可拖**的时间线，与 Chrome 近期内置 AI / 扩展更新时间吻合，但未证实。
