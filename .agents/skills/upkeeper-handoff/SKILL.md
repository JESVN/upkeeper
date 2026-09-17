---
name: upkeeper-handoff
description: Take over Upkeep development in a fresh session — or run it unattended. Use when a new session continues earlier work (用户说 接着做/继续/交接 or pastes a bare task like "做 M0"), when the previous conversation ran out of context, or when the user leaves and wants work to continue without them (无人值守/我去睡觉/别问我/我出门了/unattended) so nothing stalls on an unanswered question. Rebuilds the task, its acceptance criteria, and the constraints in force before touching anything, and refuses to start while the record is missing or ambiguous.
---

# 接手上一个会话的开发

新会话里没有上一轮的上下文。这个 skill 用仓库里的**权威文件**重建它，而不是猜，也不要靠用户口述历史。
## 1. 先读三样东西，按这个顺序

1. **`.agents/progress.md`** — 状态：做到哪一步、下一步、有什么未决。写入规则在它文件顶部。
2. **根 `AGENTS.md`** — 每次会话自动加载，但要逐条过一遍；它是本仓库的边界。
3. **任务相关的 `docs/` 与决策记录** — 按 `AGENTS.md` 的「防御性模式」表选读，不要通读 `docs/`。`.agents/notes/proposed/architecture/` 里与任务相关的笔记**必须读**，尤其是 `Alternatives considered` —— 上一轮否决过什么就写在那里，重提被否方案是浪费时间。

## 2. 复述，然后等确认

动手前用不超过十行说清四件事：**交付什么**（可验证的产物）、**怎么算完成**（引用哪条验收）、**哪些约束在生效**（相关的 3–5 条，不要罗列全部）、**哪些未决要用户先定**（取 `progress.md` 的「未决」）。

有歧义就问，不要用「我理解你想…」蒙过去；确认后再动手。

## 3. 允许与禁止

**允许**：读任意文件、跑只读命令（`git status`、`cargo --version`、`pnpm ls`）、在确认后写代码。

**未经用户明确同意不得**：

- 扩大范围（做 M0 时顺手重构 `docs/`）
- 改动 `docs/` 里的契约或 `.agents/notes/` 里的决策 —— 那是设计变更，要走「先改设计再实现」的路径，而不是实现阶段的顺手之举
- 执行任何会删除或移动文件的命令（先按 [upkeeper-cleanup-safety-review](../upkeeper-cleanup-safety-review/SKILL.md) 走一遍）
- 声明任何检查通过 —— 没跑过的写「未运行」，并先按 [upkeeper-pre-push-checks](../upkeeper-pre-push-checks/SKILL.md) 挑证据

## 4. 记录缺失或与仓库现状矛盾时

`progress.md` 缺失或过期时以仓库现状为准（`git log`、实际文件、命令输出比手写的进度可信），并区别处理：

- 说已完成但文件不存在 → 当作未完成，并在回复里说明这个矛盾。
- 文件整体缺失 → 从 `git log --oneline -10` 与 [README.md](../../../README.md) 的里程碑表重建「现在在哪」，然后**先问用户**这一步做什么，不要自行推断。

## 5. 收尾

本次做完后把状态落盘：用户打 [/wrapup](../../../.pi/prompts/wrapup.md) 时按该模板执行；用户没说结束时问一句是否收尾，不要擅自中断。

## 6. 无人值守模式（用户去睡觉/离开时）

触发：用户说「无人值守」「我去睡觉」「别问我」这类话。本节优先于默认行为。

**硬规则：不得调用问答工具** —— 它会把会话停在那里等人，正是这个模式要避免的。需要用户输入时按 [progress.md](../../progress.md) 顶部的**可逆性分流**处理：可逆的自选并记入「自主决定」，不可逆或涉外的记入「待用户确认」并跳过、继续做别的。

**不因一个问题阻塞整体**：卡住就跳到下一个可做步骤；真正无步骤可做时，总结「做到哪里、哪些在等确认」再停。退出条件见 progress.md 的分流规则。
