# 视觉风格方向（v0.1 已定稿）

本文件只记录**方向与约束**：后续做界面时必须遵守什么、禁止什么。逐项调研证据（16 个维度 × 7 个参考）与每个结论的推理过程在 [`2026-09-17-ui-reference-survey.md`](../.agents/notes/proposed/architecture/2026-09-17-ui-reference-survey.md)；方向本身的决策记录在 [`2026-09-17-ui-aesthetic-direction.md`](../.agents/notes/proposed/architecture/2026-09-17-ui-aesthetic-direction.md)。

本轮不含页面实现、组件规格与完整设计系统；令牌值另见 `docs/visual-identity.md`（按 design.md 格式，待写）。

## 前提约束

| 约束 | 来源 | 对风格的影响 |
|---|---|---|
| Windows 11 桌面应用，Tauri v2 + React 19 + Vite + Tailwind v4 | [DESIGN.md](../DESIGN.md) §7 | 不能靠浏览器新特性；WebView2 即 Chromium 最新稳定版 |
| UI 文案为中文 | [ui.md](ui.md#copy-and-notifications) | **字体必须用系统字体栈**：打包 CJK webfont 体积 5–20 MB，且与「纯本机、无网络」矛盾 |
| 单窗口、信息密度高（应用列表 / 逐条进度日志 / 清理路径清单 / 历史 / 设置表单） | [ui.md](ui.md) | 风格必须能承载表格与长清单，不能只会做 hero |
| 离线、无遥测、证据驱动、文案克制 | [AGENTS.md](../AGENTS.md)、[docs/AGENTS.md](AGENTS.md) | 「安静、精确、可核对」是产品性格，装饰性风格与其冲突 |
| 实现者是单人 + agent，没有专职设计师 | 项目现状 | 风格必须**规则化、可判定**（栅格、细线、单一强调色），不能依赖手绘功力 |
| 已有 token 落点：Tailwind v4 `@theme` 与 `src/styles/` 的状态色 | [src/styles/README.md](../src/styles/README.md) | 方向必须能表达为 CSS 自定义属性 |

## 已确认约束（2026-09-17 由作者确认）

| # | 问题 | 结论 | 对方向的影响 |
|---|---|---|---|
| 1 | 默认模式 | **跟随系统** | 必须明暗成对同源，且**两套都要完整设计**，不能只做一套再加补丁 |
| 2 | 自绘窗口 | **接受**（Mica/亚克力 + 无边框标题栏） | 窗口壳层可进色调，但 Mica 是**带色偏的合成底**，对比度不能按纯色算 |
| 3 | 系统强调色 | **尊重** | 主题色由系统决定，**基座不能再是暖色**（见下） |
| 4 | 中文正文基线 | **14px**；不要求 DPI 下布局不放大 | 接受系统缩放放大布局；密度按 14px 行高重新对齐 |
| 5 | 全键盘操作 + 快捷键表 | **需要** | 焦点环升为设计一等公民；密度须为键盘可达性让路 |
| 6 | 最小窗口 / 多面板 | **不需要**（不做多面板、不做多窗口） | 单窗口单列骨架成立，侧栏可折叠但不必做面板拖拽 |
| 7 | 导出 / 打印 | **不需要** | 浅色不必为了打印而牺牲屏幕效果 |
| 8 | 文档/展示页更编辑化 | **不允许** | 文档、README 配图与桌面端**同一套语言**，不得出现广告式排版 |

### 两个必须遵守的实测结论

**(a) 尊重系统强调色 ⇒ 基座走中性，不走暖色。** 实测本机 `AccentColor = 0xFFD47800`（Windows 按 ABGR 存储 → **`#0078D4`** Windows 蓝），`ColorizationColor = 0xC40078D4`，`ColorPrevalence = 0`。蓝强调配暖纸底是最容易显脏的组合，且强调色随主题可变任何色相（本机 `AccentPalette` 里同时存着青蓝与橙 `#F7630C`）。

**(b) 系统强调色本身过不了无障碍，因此必须有修正层。** 实测：

| 组合 | 对比度 | 判定 |
|---|---|---|
| `#0078D4` 填充 + 白字 | 4.53:1 | 勉强过 AA |
| `#0078D4` 作细线/文字 on 暗底 `#1C1B1A` | **3.80:1** | **不合格** |
| `#0078D4` 作细线/文字 on 纸底 `#FFFCF0` | 4.41:1 | 不合格 |
| flexoki blue-600 `#205EA6` on 纸底 | 6.36:1 | 合格（回退用） |
| flexoki blue-400 `#4385BE` on 暗底 | 4.37:1 | 不合格（文字用途；改取 blue-300 `#66A0C8` 6.08:1） |
| flexoki orange-400 `#DA702C` on 暗底 | 5.19:1 | 合格（回退用） |
| 墨 `#100F0F` on 纸 `#FFFCF0` | 18.62:1 | AAA |
| 亮字 `#F2F0E5` on `#1C1B1A` | 15.04:1 | AAA |

**强调色只用于填充块**（按钮底、选中行、进度条），**不用于细线或小字**；不足时映射到同色相的 flexoki 阶，仍不足则告警。这层是实现前就要有的，组件直接读原始强调色算缺陷。

## 方向

### 主方向：墨与纸 · 中性优先（Ink & Paper）

- **关键词**：纸/墨中性底、系统强调色、细线结构、平面无渐变、安静而精确、键盘优先。
- **色彩**：flexoki 中性基座 —— 亮 `#FFFCF0` 纸 + `#100F0F` 墨；暗 `#1C1B1A` 底 + `#F2F0E5` 字。状态色固定 6 个，与 [ui.md](ui.md#row-states) 的徽标 1:1；新增状态必须同时新增徽标与对比度实测。
- **双模式**：亮/暗两套同时定义、同时审查；面板底色自绘不透明层，不直接坐在 Mica 上算对比度。
- **字体**：拉丁 `Segoe UI Variable`，中文 `Microsoft YaHei UI`，等宽 `Cascadia Mono` → `Consolas`；正文 14px 基线；版本号、路径、日志、字节数用等宽 + tabular；随系统缩放放大布局。
- **布局与密度**：8px 栅格；1px 细分割线替代卡片投影；圆角 ≤6px（浮层 8px）；阴影只用于浮层；行高列表 36px / 表格 32px / 路径清单 24px；单窗口单列骨架，侧栏可折叠。
- **键盘优先**：焦点环是一等视觉元素（外环 2px + 内环 1px），**其可见性不依赖强调色**；`Ctrl+K` 命令面板作全键盘入口；快捷键表进设置页；密度上限由键盘可达性决定 —— 只能鼠标操作的行内动作算缺陷。
- **窗口壳层**：无边框标题栏 + Mica；标题栏与面板叠加自绘层，保证拖拽区、系统按钮、焦点环在三重叠加下可辨。
- **适用**：全部界面（应用列表、进度、清理、设置、历史、发现候选），文档与 README 配图同一套语言。

#### 对比度修正层

```
输入：系统强调色 A、当前底色 B、用途 U（填充 / 图形 / 文字）
1. contrast(A, B)
2. 填充 ≥ 4.5（带白字时另取白字或墨字较优者）；图形/边框 ≥ 3.0；文字 ≥ 4.5
3. 不满足则映射到同色相 flexoki 阶：
   蓝径 → blue-600（on 纸）/ blue-400（on 暗）
   橙径 → orange-600（on 纸）/ orange-400（on 暗）
4. 仍不满足则告警，不静默降级
```

阶名的具体色值与两套实测对比度见 [docs/visual-identity.md](visual-identity.md#the-accent-and-its-correction-layer)（那里是令牌的唯一归属）。

它是 token 计算函数，不是手写死值；在 design.md lint 里对明暗两侧各验一次。

### 局部：仪表面（Instrument Surface）

- 仅用于进度日志、`update://progress` 明细、清理路径清单、`history`、错误堆栈：等宽、高对比、行高 24px、数字右对齐、列宽固定、允许水平滚动。
- **中文在此区仍回退雅黑**（Windows 没有可用的 CJK 等宽），只对拉丁字符与数字做对齐，**不做中文等宽假象**。
- 取 taste-skill 的 Tactical Telemetry 只到「等宽 + 密度」，不取扫描线与磷光。
- **不得外溢**到设置、历史列表、引导页；区内也不靠颜色区分错误与普通行。

### 兜底：原生精修（Native-polished）

- 与主方向**只差中性底的温度**（冷中性 vs 微暖）；强调色同样走系统强调色 + 修正层。
- 8px 栅格、8px 圆角、分段控件与列表贴近 Fluent 习惯、Mica 窗口背景。
- 触发条件：主方向在实测（夜间模式、HDR、非 100% 缩放、Mica 叠加）中反复显脏且无法修正。
- 风险：容易落入「没有灵魂的 SaaS 仪表盘」；采用前必须穷尽主方向的修正手段（优先把纸底向中性收）。

## 禁止项

| 禁止 | 原因 |
|---|---|
| 照搬 ui-design-agent-kit 的 ink + lime/coral | 无 SPDX 许可（代码/素材/字体均不可复用）；霓虹正属反-slop 禁令 |
| 整体 CRT / Telemetry 化（扫描线、磷光、准星） | 长期使用疲劳、显廉价；且中文无等宽字体，演出无法对齐 |
| 把 rinpa 的装饰语言（金箔、植物纹样）搬进界面 | 与「工具应当安静」冲突；纹理在 100% 缩放下成为噪声 |
| 引入 webfont 展示字体（Syne/Manrope/DM Mono 等） | 与中文混排不一致；离线打包体积与「纯本机」定位矛盾 |
| 双原型混用（Swiss 与 CRT 同界面切换） | taste-skill 硬规则禁止；直接毁一致性 |
| 克隆式复刻某个网站/应用的界面 | 版权风险；网站范式不匹配桌面密度与键盘操作 |
| 把系统强调色当细线/小字直接铺在低对比底上 | 已实测不合格（3.80:1 / 4.41:1） |
| 文档页做营销式编辑排版 | 第 8 条已确认不允许 |
| 不定基线直接开写页面 | 结果就是「没有灵魂的 SaaS 仪表盘」 |

**允许的密度分区不等于混用**：窗口壳层、列表、表单统一走主方向的结构规则；只有上述「仪表面」区域采用等宽高密度。这是同一原型下的密度差异，不是两套皮肤。

## 参考项的角色

七项的完整评估见 [调研记录](../.agents/notes/proposed/architecture/2026-09-17-ui-reference-survey.md)，这里只记各自在本项目中的角色：

| 参考 | 角色 |
|---|---|
| `kepano/flexoki` (MIT) | **唯一被完整采用**的系统 —— 色彩基座与色阶 |
| `google-labs-code/design.md` (Apache-2.0) | 格式与门禁：承载令牌、WCAG 对比度检查 |
| `Leonxlnx/taste-skill` (MIT) | 判据来源：反-slop 清单、Swiss 原型结构规则、三个旋钮 |
| rinpa 图鉴条目 | 审美词汇：平面化、纸墨温度（只在中性阶）、连续构图 → 重复分割 |
| `alchaincyf/huashu-design` (MIT) | 流程：三方向取稿与评审纪律 |
| `muzimu217/ui-design-agent-kit`（**无许可**） | 仅作反例出现，**任何内容都不得进入本仓库** |
| `JCodesMore/ai-website-cloner-template` (MIT) | 方法：参考驱动实现、组件与图标基线（shadcn/ui + lucide） |

## 引用与许可

- 确切提交号（`--depth 1` 克隆的浮动 main 不可重现，故钉住）：ui-design-agent-kit `2b8cb68`（无许可）、cloner `a53892c`（MIT）、design.md `9bf8eae`（Apache-2.0）、flexoki `8d723ba`（MIT，Copyright © 2023 Steph Ango）、taste-skill `e79ca9e`（MIT）、huashu `c4b8367`（MIT）。详见 `_recon/REFS.md`。
- 强调色的回退值用阶名引用色阶（如 blue-600），具体色值与明暗两套值写在 [docs/visual-identity.md](visual-identity.md)，那里是令牌的唯一归属。
- **可搬与不可搬**：只允许把参考转写为约束与判据；唯一例外是 flexoki 的色值（MIT 允许复制，但写进 `docs/visual-identity.md` 时必须带版权与许可声明）。
- 6 个上游仓库的完整克隆（180 MB）已删除，它们之中只留下 `_recon/quoted/`（164 KB / 11 文件）与 `_recon/REFS.md`；`_recon/` 整个目录不进 git。

## 后续

- **下一步**：按 [design.md](https://github.com/google-labs-code/design.md) 格式写 `docs/visual-identity.md`（令牌值 + 对比度实测表），并把 `npx @google/design.md lint docs/visual-identity.md` 加进 M0 的 `pnpm run` 门禁。
- **语言例外**：本文件为中文，理由与范围记在 [docs/AGENTS.md](AGENTS.md#writing-rules)。
- 方向确认后本文件冻结为约束；新决定进 Agent Note，正文不再回改。
