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

---

## 当前

**M0 · 步骤 0/5 · 尚未开工**（工具链未安装）

## 已完成

- [x] 设计与契约定稿到 v0.3 — [DESIGN.md](../DESIGN.md) 与 5 篇 [Agent Note](notes/proposed/architecture/)
- [x] 视觉风格方向定稿 — [docs/style-direction.md](../docs/style-direction.md)，调研证据在 [调研记录](notes/proposed/architecture/2026-09-17-ui-reference-survey.md)
- [x] 文档体系与门禁规则建立 — [AGENTS.md](../AGENTS.md)、[docs/AGENTS.md](../docs/AGENTS.md)、4 个 skill
- [x] 会话交接机制建立 — [/wrapup](../.pi/prompts/wrapup.md) 落盘、[upkeeper-handoff](skills/upkeeper-handoff/SKILL.md) 接手、本文件记状态
- [x] 仓库初始化并推送 — 远端 `JESVN/upkeeper`，最近提交 `12315ab`

## 未决

- **Tailwind v4 的 `@theme` 分不分两套文件**：跟随系统明暗（[style-direction.md](../docs/style-direction.md) 约束 1）意味着两套值都要定义，是分开两个文件还是单文件加媒体查询，需在搭前端时决定。
- **视觉令牌尚未成文**：`docs/visual-identity.md` 还没写（按 design.md 格式 + 对比度实测表），写它是 M0 之后、写组件之前的事。
- **门禁脚本还不存在**：`docs/AGENTS.md` 声明的字数上限目前靠人工核对，M0 要把 `doc-budgets`、`check-links`、`notes-format` 补进 `scripts/`。

## 待用户确认

**无人值守期间不得在本节留空而停下工作**：能绕开就先做没被阻塞的部分，绕不开就跳到下一项，并把原因写清楚。醒来后逐条回复即可。

（空）

## 自主决定

无人值守期间由代理自选的**可逆**决策，一条一行：选了哪个、为什么、怎么改回去。用户醒来后可否决。

- 本轮无（交接机制刚建立，尚未进入无人值守开发）

## 下一步

**跑 `rustup --version` 确认工具链是否已装**；未装则按 [docs/development.md#bootstrap-without-a-working-system-proxy](../docs/development.md#bootstrap-without-a-working-system-proxy) 的步骤安装（必须先按注册表读代理，`rustup`/`cargo` 不读系统代理）。
