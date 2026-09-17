# AGENTS.md

Upkeep 是一个只跑 Windows 的桌面控制台，把本机的应用更新与「更新残留清理」收进同一个界面：一屏看清哪些应用有新版本，能无人值守的形态批量更新，并把更新器留下的垃圾安全回收。改动 `src-tauri/src/` 之前先读 [docs/architecture.md](docs/architecture.md)；写文档遵循 [docs/AGENTS.md](docs/AGENTS.md)；[DESIGN.md](DESIGN.md) 是冻结的 v0.1 设计记录。

仓库状态：仅骨架。没有工具链，没有 `Cargo.toml`，没有 `package.json` —— 下面每条命令与路径都是 M0 必须满足的契约，今天还跑不起来（[里程碑](DESIGN.md#8-里程碑与验收标准)）。

## 常驻规则

- **只做 Windows 11 x64。** 不写跨平台抽象，不写 `#[cfg(unix)]` 分支，不做可移植路径层；本机实测事实以 [docs/environment.md](docs/environment.md) 为准。
- **副作用只发生在 Core。** UI 只渲染与选择；一切 spawn、删除、提权都在 `src-tauri` 里发生，且每个会改动系统的操作都必须走「计划 → 预览 → 执行」三段（[分层](docs/architecture.md#layering)）。
- **不做自动扫描，也不自动勾选。** 启动、窗口聚焦、定时轮询都不扫描：打开窗口只渲染 `state.json` 里上次的结果与它的新鲜度，从未检查过就是空态；更新目标一律来自用户手动勾选或点击，「全选可更新」只勾选、不执行；发现候选（`discover`）同样只读、只在用户点「发现应用」时跑，确认前不写盘，写也只写用户级 `apps.yaml`（[交互规则](docs/ui.md#interaction-rules)）。
- **绝不驱动 GUI 应用的更新器。** `external-ui` 与 `green` 形态只做检测 + 徽标 + `[打开应用]` / `[下载页]`；Upkeep 永不运行 NSIS/MSI/安装器，永不写进应用的安装目录（[非目标](DESIGN.md#1-目标与非目标)）。
- **代理每次都从注册表读，只注入子进程。** 读 `HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings` 的 `ProxyEnable` / `ProxyServer`；不写进父进程环境，不改注册表，端口不写死成 `10808`（[规则](docs/execution-safety.md#proxy-resolution)）。
- **不是所有工具都读系统代理。** .NET 会自动继承；`gh`、`omp`（Bun fetch）、`curl`、`rustup`、`cargo` 不会，必须显式给 `HTTPS_PROXY` 或换镜像源（[实测表](docs/environment.md#proxy-behaviour-by-tool)）。
- **子进程绝不接触 TTY。** stdin 恒为 `Stdio::null()`；输出进入日志与 UI 之前先剥掉 ANSI 转义（[执行规则](docs/execution-safety.md)）。
- **清理只认 glob 白名单、带进程守卫、默认 dry-run。** [三条硬规则](docs/cleanup-rules.md#the-three-hard-rules)不是建议；目标进程在跑就整条规则跳过，绝不只跳过一个文件。
- **形态是「机制」，不是「应用清单」。** 加一个应用只改一条 [config/apps.yaml](config/apps.yaml) 条目；加一个生态只加一行管理器表（winget、pnpm、uv、dotnet、pip、go… 都在表里）；只有真正的新机制才写 `providers/*.rs`。`declarative` 是零代码兜底 —— 任何能用命令表达的更新都能纳管，绝不在 `core/` 里开 per-app 分支（[契约](docs/providers.md)、[操作手册](docs/cookbook/adding-a-provider.md)）。
- **失败就地隔离。** 单个 provider 超时只让该行变红，不牵连扫描或批量（除非 `on_failure: stop`）（[scan](docs/architecture.md#scan)）。
- **`DESIGN.md` 定稿前是活文档，定稿后冻结。** 它现在仍在评审（v0.x 草案）：设计要改就直接改它，版本 +1 并在「变更记录」留一行；M0 动工后它冻结在该版本，之后的改动进 [Agent Note](.agents/notes/README.md) 与 `docs/`，正文不再回改。
- **保留 PowerShell 基准脚本。** `omp-clean.ps1` 与 `omp-maintain.ps1` 继续作为 CLI 兜底与行为基准；Upkeep 结果与它不一致时按 bug 处理，不构成删除它们的理由（[风险 6](DESIGN.md#9-风险与未决问题)）。
- **未核实的东西不进 `config/apps.yaml`。** 版本源没经过探测确认就保持 `# TBD`（界面显示「未知」），管理器的命令没在真实机器上跑过就不写进管理器表 —— 不许猜；`discover` 的候选要如实标注证据与建议形态（[操作手册](docs/cookbook/verifying-a-release-source.md)）。

## 目录结构

```
AGENTS.md                 常驻规则（本文件）
DESIGN.md                 v0.1 设计记录，2026-09-17 冻结
README.md / README.en.md     中文（默认）与英文首页：是什么、适合谁、里程碑、快速开始、FAQ、文档地图
config/apps.yaml          出厂默认的应用登记表
docs/                     当前状态文档（标准见 docs/AGENTS.md）
  architecture.md         分层、流水线、IPC 面
  environment.md          本机实测：清单、路径、残留、代理行为
  execution-safety.md     子进程、代理、提权、超时、取消、进程守卫
  cleanup-rules.md        规则语义、三条硬规则、审查清单
  config-schema.md        apps.yaml 与 settings 的逐字段参考
  providers.md            Provider trait 契约、五种机制与管理器表
  ui.md                   面板、徽标、每个面板消费的事件
  development.md          工具链前提、代理/镜像配置、目标命令
  testing.md              每个里程碑必须拿出的证据
  cookbook/               带验证步骤的操作手册
  postmortem/             规则背后的故障故事（postmortem/README.md）
.agents/notes/            决策记录：为什么、放弃了什么、代价
.agents/skills/           可复用的 agent 工作流
scripts/                  仓库内辅助脚本（字数/链接门禁）；omp 的 PowerShell 基准脚本留在仓库外
src/                      React 19 + Vite 前端（src/AGENTS.md）
  ipc/                    唯一允许出现命令名与事件名的地方
  features/               一个产品面板一个目录
  components/             共享的纯展示组件
  lib/                    格式化、版本显示、UI 文案
src-tauri/                Rust 内核（src-tauri/AGENTS.md）
  src/commands/           #[tauri::command] 面：core 之上的薄适配
  src/core/               config → scan → plan → exec → verify → clean → history
  src/providers/          一种应用形态一个文件
  src/platform/           唯一允许碰 Win32、WinReg、HTTP、进程表的地方
  src/state/              state.json、history.jsonl、按运行分文件的日志
  tests/                  Rust 集成测试
```

## 命令

这套命令由 M0 建立；在那之前它们都不存在。

```sh
pnpm install             # 前端依赖（react、vite、tailwind）
pnpm tauri dev           # 开发窗口；需要 Rust 工具链
pnpm tauri build         # 打出 NSIS / MSI 到 src-tauri/target
pnpm typecheck           # 对 src/ 跑 tsc --noEmit
pnpm test                # 前端单元测试
cargo fmt --check        # 在 src-tauri/ 内执行
cargo clippy -- -D warnings
cargo test               # 集成测试，含 dry-run 清理 fixture
pnpm run doc-budgets     # docs/AGENTS.md 中声明的字数上限
```

`rustup` 与 `cargo` 不读 Windows 系统代理。首次构建前给该进程单独导出 `HTTPS_PROXY`，或配置镜像源（[步骤](docs/development.md#bootstrap-without-a-working-system-proxy)）。

## 约定

- **`commands/` 是边界，不是一层。** 命令只做参数校验、调 `core`、返回带类型的结果；业务逻辑与 Win32 调用绝不出现在这里。
- **所有可调项都是 `apps.yaml` 的 `settings:` 字段。** 不拿 `DEFAULT_*` 常量冒充可配置；协议常量、注册表路径与清理安全规则固定写在代码里。
- **IPC 载荷类型只在一处定义**（[docs/architecture.md](docs/architecture.md#ipc-surface)）并在两端镜像；命令名与事件名的字符串字面量只允许出现在 `src/ipc/`。
- **进度事件是 `scan://progress`、`update://progress`、`clean://progress`。** 在工作单元成功之后才 emit，绝不提前，这样 UI 不可能显示没发生过的事。
- **历史只追加 JSONL。** `state.json` 是带 `checked_at` 的缓存，绝不是「发生过什么」的事实来源（[history](docs/architecture.md#history)）。
- **失败必须携带 `app_id`、阶段、`exit_code` 与日志路径。** 每个红行都能一键打开它自己的日志。
- **提权结果经临时文件回传**，因为 UAC 会切断管道（[elevation](docs/execution-safety.md#elevation)）。
- **取消要杀整棵进程树**，不是只杀直接子进程。
- **每次更新后都必须校验** —— 版本变化或哈希断言，并记入历史；没有校验的更新不算成功（[verify](docs/architecture.md#verify)）。
- **UI 文案集中在一个模块**（`src/lib/`），绝不内联在组件里（[UI 规则](src/AGENTS.md)）。
- **注释与文档写完整契约，不写推理过程**（[标准](docs/AGENTS.md#writing-rules)）。
- **git 提交信息必须写中文。** 格式 `类型: 中文说明`，类型用 `feat` / `fix` / `docs` / `design` / `chore` / `refactor` / `test` 之一；标题与正文都用中文，不写英文描述（类型前缀保留英文是为了工具链兼容）。
- **非平凡改动必须在同一次改动里补一篇 Agent Note** 并更新对应文档；只有机械或局部编辑可豁免（[范围](.agents/notes/README.md#when-to-write-one)）。
- **`unsafe` 块必须注释它依赖的不变量**，且只允许出现在 `src/platform/`，其它地方一处都不许。

## 防御性模式

动子进程、提权、超时、取消或进程收尾之前，先读 [docs/execution-safety.md](docs/execution-safety.md)；动任何会删除或移动文件的东西之前，先读 [docs/cleanup-rules.md](docs/cleanup-rules.md)。

## 修改本文件

每条常驻规则都要自成一体，并链到掌握细节的文档。根规则的入选标准是「每次会话都需要」；场景化的流程属于 `docs/` 或某个 skill。能在不失清晰的前提下压缩就压缩；只有当内容确实需要更多空间时，才去抬高 [docs/AGENTS.md](docs/AGENTS.md#word-budgets) 里的上限。
