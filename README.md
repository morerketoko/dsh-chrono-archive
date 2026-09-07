# Chrono Archive · 时序档案馆

为 DeepSeek Harness Web UI 打造的原创复古时序皮肤插件。
视觉语言：复古时代感 × 超现实档案馆 × 老式印刷物 × 优雅现代 UI ——
灵感来自《重返未来：1999》的氛围，但**不含任何官方素材**（原创印章/字标/调色板）。

- 插件类型：DSH 动态 Cordis Plugin（Host + Client），官方机制，零核心修改
- 平台/版本：DeepSeek Harness Web 0.1.2-rc.1（web profile 组合）
- 卸载即恢复默认主题（token 层 / 样式 / 插槽 / 路由全部随 Run 移除）

## 目录结构

```
chrono-archive/
├─ wallpapers.txt            ★ 运行时唯一换图入口（清单 + @全局参数）
├─ art/                      内置壁纸副本（插件 fs 可读范围 = 当前工作区）
├─ skin.css                  皮肤样式（壁纸层/档案字体/滚动条/装饰类）
├─ palettes/
│  ├─ light.txt              浅色语义调色板（key: #hex）
│  ├─ dark.txt               深色语义调色板（与浅色分别调校）
│  └─ <壁纸名>.light.txt     可选：按壁纸覆盖调色板（无需建则忽略）
├─ assets/favicon.svg        原创印章 favicon
└─ plugin/
   ├─ host-body.js           Host 半区源码镜像（= pkg-2 code.host）
   └─ client-body.js         Client 半区源码镜像（= pkg-2 code.client）
```

## 换壁纸（只改一个文件）

编辑 `wallpapers.txt`：

```ini
@pos center 38%     # 背景定位
@opacity 0.5        # 壁纸不透明度（0.38 ~ 0.55 更明显）
@blur 3px           # 背景模糊 2 ~ 6px
@sat 1.0            # 饱和度
@contrast 1.02      # 对比度
@size cover         # 尺寸策略
@cycle 300          # 轮换间隔秒；0 = 固定单张
@solidity 0.8       # 界面底色不透明度（0.5 更透 → 1.0 更实）

D:\wallpapers\one.png                 # 需复制进 art/ 或工作区可读位置
art\two.png :: right center           # 该张单独定位
```

- 多行 = 多壁纸轮换；空文件/全部缺失 = 回退纯色档案底。
- **沙箱注意**：动态插件 Host 只能读当前工作区（`F:\dsh试验工作区`）；外部盘符
  路径会被跳过。请把图片放进 `art/`（或工作区任意路径），再在清单里引用它。
- 换壁纸无需改动任何 CSS/代码；重启插件（stop → run）或等待轮换周期生效。
- 位置感知：`backgroundPositionX/Y/Scale` 经 `@pos` 与行内 `:: 定位` 控制，
  避免人物脸部 / 主体建筑被 sidebar / composer 遮挡（例如 `right center`、`center 42%`）。

## 调色板（自动派生整套 --dsw-* token）

`palettes/light.txt` 与 `dark.txt` 是两套**独立调校**的语义色板
（浅色：旧纸/米白/暖灰/深棕/铜金/酒红/墨绿；深色：深蓝黑/墨灰/暗金/灰蓝）。
每个语义键会派生 ~70 个 DSH `--dsw-alias-* / --dsw-specific-*` 及 `--chrono-*`
token，无需手工维护几十个 CSS 颜色。
给某张壁纸专属配色：复制为 `palettes/<壁纸文件名>.light.txt`，只写要覆盖的键即可。

## 安装 / 卸载（当前会话）

- 安装：在对话中 `cordis_run` 激活 `chroa-1`（当前 Package `pkg-2`；首次需在 Run 卡批准）。
- 卸载恢复默认：`cordis_stop(chroa-1)` 或 `cordis_undefine(chroa-1)`。

## 重新构建 / 持久化说明

本插件是**动态插件**（随进程存在，按会话管理）。如需在 DSH 重启后仍加载，
把 `plugin/host-body.js` 与 `plugin/client-body.js` 封装为常规 client 模块包
（可参考 `dsh-better-sidebar` 的 profile bundle 方式）——本版不修改 profile 组合。

## 已知限制

- 组件级重绘依赖官方 token + 自有插槽，不硬编码 hash 类名（见报告 §12）。
- favicon/标题在 index 注入，卸载后需刷新页面恢复原始 favicon。
- 本环境动态 Client 无 DOM/canvas 权限，自动取色为扩展点（当前用人工调色板文件）。
