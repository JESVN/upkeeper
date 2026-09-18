# 开发进度

## 写入规则（本文件的契约，其它地方只链接不复述）

- **只记状态，不记知识。** 契约在 `docs/`、决策理由在 `.agents/notes/`，这里再抄一遍就会与原文冲突；需要引用就写链接。
- **条目必须可验证**：跑过的命令 + 结果，或 `git log` 里能查到的提交号。写不出证据的归入「未决」或标注「未验证」，不写「基本完成」「进展顺利」这类无法核对的词。
- **与仓库现状矛盾时以仓库现状为准**：`git log`、实际文件、命令输出比本文可信；发现矛盾就在回复里说明，不静默采信任何一侧。

### 可逆性分流（无人值守时的决策规则）

| 决策性质 | 做什么 |
|---|---|
| **可逆**（改回代价小：文件组织、内部命名、实现顺序、样式值） | 自选一个合理的继续做，记入「自主决定」：选了什么、为何、怎么改回 |
| **不可逆或涉外**（软件包名、对外契约、许可证、对外发布、删除数据） | **不自选**，记入「待用户确认」并**跳过它继续做别的**，不停下等 |
| **无法判断可逆性** | 当作不可逆 |

无人值守时**不得调用问答工具**（会把会话停住等人）。小节顺序固定为：当前 → 已完成 → 未决 → 待用户确认 → 自主决定 → 下一步。

**进入与退出**：用户说「无人值守/我去睡觉/别问我/我出门了」即进入；说「我醒了/恢复正常」即退出。中途插话不算退出 —— 在明确解除之前，插入的话仍按本节处理。

---

## 当前

**M0 完成 · M1 未开工。** 工具链、Tauri v2 脚手架与三个文档门禁都已落地并跑过；扫描、更新、清理尚无代码。

## 已完成

- [x] 设计与契约定稿到 v0.3 — [DESIGN.md](../DESIGN.md) 与 5 篇 [Agent Note](notes/proposed/architecture/)（设计本身已按规则冻结，见下）
- [x] 视觉风格方向定稿 — [docs/style-direction.md](../docs/style-direction.md)，调研证据在 [调研记录](notes/proposed/architecture/2026-09-17-ui-reference-survey.md)
- [x] 文档体系与门禁规则建立 — [AGENTS.md](../AGENTS.md)、[docs/AGENTS.md](../docs/AGENTS.md)、4 个 skill
- [x] 会话交接机制建立 — [/wrapup](../.pi/prompts/wrapup.md) 落盘、[upkeeper-handoff](skills/upkeeper-handoff/SKILL.md) 接手、本文件记状态
- [x] 仓库初始化并推送 — 远端 `JESVN/upkeeper`
- [x] **M0 工具链** — `winget install Rustlang.Rustup` → rustup 1.29.1 / rustc 1.98.1 / `stable-x86_64-pc-windows-msvc`；crates 走 rsproxy 镜像（`%USERPROFILE%\.cargo\config.toml`）。证据与命令见 [M0 Agent Note](notes/implemented/process/2026-09-18-m0-toolchain-and-scaffold.md#verification)
- [x] **M0 脚手架** — Tauri v2 + React 19 + Vite 8 + TS 6 + Tailwind v4 落到根、`src/`、`src-tauri/`（未新建子工程）；`pnpm typecheck`、`pnpm build`、`cargo build`（1m39s）全绿
- [x] **M0 验收：`pnpm tauri dev` 起窗口** — 观察到窗口标题 `Upkeep`、`MainWindowHandle` 非零；随后进程树被杀干净
- [x] **三个文档门禁脚本** — `pnpm run doc-budgets`（PASS）、`check-links`（PASS，370 链接 / 56 文件）、`notes-format`（**红，1 条发现，见未决**）

## 未决

- **主方向 vs 兜底方向的对比评审（已排期）**：M1 落地后、写第一个真面板之前做一次，输入是 [_recon/DeskBox/](../_recon/DeskBox) 的 8 张截图（兜底「原生精修」的落地参考）与 [docs/visual-identity.md](../docs/visual-identity.md) 的令牌。结论只有两种：主方向继续，或按兜底把中性底改冷、圆角改 8px 并更新令牌。仍未定的是首次对比的**触发条件**——方向文档写的是「实测（夜间模式、HDR、非 100% 缩放、Mica 叠加）中反复显脏」——但那是跑起来之后的事，现在只能先按上面对比一次。
- **前端测试栏是空的**：`pnpm test`（vitest 5）0 个测试文件、`passWithNoTests` 下返回 0。M1 起按 [docs/testing.md](../docs/testing.md#layout) 补 view model 测试。
- **令牌还没进代码**：`docs/visual-identity.md` 已定稿并通过 linter，但 `src/styles/tailwind.css` 仍只声明外壳用到的几个值；六个状态色、强调色修正层、中性 alpha 阶梯都等第一个面板落地时再接（按方向文档的约定：**组件直接读原始强调色算缺陷**）。

## 待用户确认

（空：2026-09-18 由用户逐条确认完毕 —— 调研笔记改名、push、M1 由用户自己起会话、DESIGN 冻结、打包与窗口身份、Tailwind 单文件、README 补 M5、图标凑合到 M5、顺手修正的文案，全部保留。）

## 自主决定

- **DESIGN.md 冻结在 v0.3**，并按根规则改了根 `AGENTS.md` 的状态行、命令段与冻结说明，及 README 双语状态行、前提与快速开始。理由：根规则写明「M0 动工后冻结」，M0 已动工。改回：把 DESIGN.md 表头「版本/状态」两行改回「v0.3（草案，待审阅）/设计评审中」。
- **Tailwind 单文件 + `@media (prefers-color-scheme: dark)`**（原「未决」项）：一份文件里两套值，token 不可能只存在于一种模式。改回：拆成 `light.css`/`dark.css` 并在构建期切换。
- **工具链位置留默认**（`RUSTUP_HOME`/`CARGO_HOME` 在 C: 用户目录）：[docs/environment.md](../docs/environment.md#where-rust-keeps-its-files) 已论证空间不是约束、C: 盘更快。改回：卸载重装并预先设两个环境变量。
- **crates 用 rsproxy 镜像而不是每次导出代理**：镜像不受代理端口漂移影响。改回：删掉 `%USERPROFILE%\.cargo\config.toml`。
- **脚手架合并进既有目录，不新建子工程**；窗口 1080×720（最小 760×520）保留系统标题栏；标识符 `com.jesvn.upkeep`；bundle 目标 `nsis` + `msi`；`crate-type` 只留 `rlib`（去掉移动端入口）。改回：都是配置文件里的一两行。
- **门禁脚本按各自文档实现**：`doc-budgets` 从 `docs/AGENTS.md` 解析上限表（避免上限有两份），`check-links` 复刻 GitHub 的 slug 规则，`notes-format` 按 `notes/README.md` 强制必需小节 —— 所以它对调研笔记报红而不是放过。
- **顺手修正的事实性文案**（2026-09-18 用户确认保留）：README 双语的「六个面板」→「七个面板」（[docs/ui.md](../docs/ui.md) 是七个）、[docs/environment.md](../docs/environment.md) 的工具链与磁盘实测行、[pre-push skill](skills/upkeeper-pre-push-checks/SKILL.md) 里「M0 尚未创建 `Cargo.toml`」的段落、[scripts/README.md](../scripts/README.md) 里「CJK 按一个词计」的错述。

## 下一步

**M1：只读扫描 + 应用列表 + 版本对比 + 历史 + 通知**（验收见 [docs/testing.md](../docs/testing.md#required-evidence-per-milestone) 的 M1 行：版本全对、只读可自证、启动不产生子进程与出网、单行刷新不牵连其它行）。

建议的第一步，按 [docs/architecture.md](../docs/architecture.md#stages) 的顺序：

1. `src-tauri/src/state/` 的路径解析（`UPKEEP_HOME` / `%LOCALAPPDATA%\Upkeep`）与 `state.json` 原子写、`history.jsonl` 追加 —— 后面每个阶段都要用。
2. `core/config`：读 `config/apps.yaml`、解 `%VAR%`、按 [docs/config-schema.md](../docs/config-schema.md) 校验；先用现成的 [config/apps.yaml](../config/apps.yaml)。
3. `providers/mod.rs`（trait + `Form` + 注册表）与第一批 provider：`self-update-cli`（`omp`）与 `manager`（npm 全局），`latest` 来源链按 [docs/providers.md](../docs/providers.md)。
4. `core/scan` + 单行刷新，`commands/` 只做校验与事件，`src/ipc/` 镜像载荷类型。
5. 只读自证的测试：对受管目录在扫描前后取哈希并比对（[docs/testing.md](../docs/testing.md#required-evidence-per-milestone)），以及「启动不 spawn、不出网」的测试。

先读：`src-tauri/AGENTS.md` · `src/AGENTS.md` · [docs/architecture.md](../docs/architecture.md) · [docs/providers.md](../docs/providers.md) · [docs/config-schema.md](../docs/config-schema.md) · [docs/ui.md](../docs/ui.md)（行状态与徽标）。
