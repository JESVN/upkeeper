# Upkeep

[English](README.en.md)

**只跑 Windows 的本地桌面控制台：把五种形态各异的应用更新收进一个界面，并把更新器留下的残留安全回收。**

![Status](https://img.shields.io/badge/status-skeleton-orange)
![Platform](https://img.shields.io/badge/platform-Windows%2011%20x64-lightgrey)
![Tauri](https://img.shields.io/badge/Tauri-2-24C8DB)
![React](https://img.shields.io/badge/React-19-61DAFB)
![Rust](https://img.shields.io/badge/Rust-stable-black)

> 仓库当前是**骨架**：有目录、契约与文档，但没有 `Cargo.toml`、没有 `package.json`、本机未装 Rust 工具链。界面与命令由 M0–M4 逐步落地，见 [里程碑](#-里程碑)。

---

## 这是什么

Upkeep 是纯本机运行、不带账号的桌面工具，只发起版本检查与更新所需的官方源请求。它做三件事：**看得见**（一屏看清当前版本 vs 最新版本）、**一键更新**（能无人值守的形态批量更新，带进度、失败隔离、代理注入与 UAC 提权）、**残留清理**（先出预览与字节账目，再按白名单删除）。

它管着五种更新路径完全不同的东西：

| 形态 | 例子 | 更新方式 | 无人值守 |
|---|---|---|---|
| 自更新 CLI | `omp`、`pi`、`codex`、`claude` | 工具自己的 `update` | ✅ |
| npm 全局包 | `@github/copilot`、`mcporter` … | `npm i -g <pkg>@latest` | ✅ |
| Chocolatey | `python`、`vcredist140` | `choco upgrade` | ✅ 提权后 |
| 桌面应用 | PiDeck、CC Switch、Clash Verge | 应用自己更新 | ❌ 只检测提醒 |
| 绿色软件 | Beyond Compare、Apifox | 手动下载 | ❌ 只给下载页 |

**适合：** 本机同时装着多种 CLI、全局 npm 包、Chocolatey 包和自带更新器的桌面应用，更新一次要记五套命令、清一次要手翻 `%TEMP%` 的人。
**不是：** 包管理器（`choco` / `npm` 仍由官方命令执行）、跨平台工具、应用商店；**绝不**代跑桌面应用的安装器。

---

## 📑 目录

- [这是什么](#这是什么)
- [✨ 核心亮点](#-核心亮点)
- [🧩 功能总览](#-功能总览)
- [🏗 工作原理](#-工作原理)
- [🗺 里程碑](#-里程碑)
- [📦 获取与安装](#-获取与安装)
- [🧰 快速开始（从源码运行）](#-快速开始从源码运行)
- [❓ 常见问题 FAQ](#-常见问题-faq)
- [🔒 安全与隐私](#-安全与隐私)
- [🧑‍💻 开发指南](#-开发指南)
- [📚 文档地图](#-文档地图)
- [🤝 参与贡献](#-参与贡献)
- [📄 License](#-license)

---

## ✨ 核心亮点

- 🎛️ **五种形态一个列表** —— 当前版本与最新版本并排；桌面应用给徽标与一键打开应用 / 下载页。
- ⚡ **批量更新说真话** —— 逐条进度、单条失败不牵连、每个进程独立超时、取消即杀整棵进程树。
- 🧹 **清理先预览再动手** —— 声明式 glob 规则 + 进程守卫 + 陈旧版本比对，先给「删什么、多少字节」。
- 🛡️ **删除可审计** —— 默认 dry-run、只删白名单匹配项、登录态显式保护、当前版本永不误删。
- 🔌 **代理只给子进程** —— 每次运行实时读注册表，不写注册表、不改父进程环境、端口不写死。

---

## 🧩 功能总览

六个面板：**应用列表**（版本对比与状态徽标，单行失败不影响其它行）、**进度日志**（阶段、吞吐、ETA、退出码，失败行可一键开日志）、**残留清理**（逐规则给匹配数与字节数，确认后才执行）、**设置**（代理、并发、超时、保留策略、UAC 策略）、**历史**（每次动作一行 JSONL，只追加）、**通知**（跑完提示）。界面规则与徽标定义见 [docs/ui.md](docs/ui.md)。

清理的三条硬规则：**只删 glob 匹配项**、**目标进程在跑就整条跳过**、**默认 dry-run**；语义与审查清单见 [docs/cleanup-rules.md](docs/cleanup-rules.md)。每次更新都会校验版本确实变了，否则记为「校验失败」并保留回滚副本。

---

## 🏗 工作原理

```txt
UI（React）     六个面板：只渲染状态、只发计划
   │  IPC       Tauri 命令 + 事件（scan://progress 等）
Core（Rust）    config → scan → plan → exec → verify → clean → history
   │             providers/* 一种形态一个文件 · platform/* 唯一碰 Win32 / 注册表 / 进程的地方
落盘            %LOCALAPPDATA%\Upkeep：state.json · history.jsonl · logs/ · rollback/
```

一条原则贯穿全部：**副作用只在 Core，且必须走「计划 → 预览 → 执行」** —— 点下的按钮执行的就是它刚展示过的那份计划。完整分层、阶段契约与 IPC 表见 [docs/architecture.md](docs/architecture.md)。

---

## 🗺 里程碑

| 阶段 | 交付 | 验收 |
|---|---|---|
| **M0** | 工具链与 Tauri 脚手架 | `pnpm tauri dev` 能起窗口 |
| **M1** | **只读**扫描 + 应用列表 + 版本对比 + 历史 + 通知 | 版本全对；全程不修改文件（哈希自证） |
| **M2** | 批量更新（自更新 CLI + npm 全局）+ 实时进度 + 代理注入 | `omp` / `pi` 一键升级；父进程无代理残留；失败隔离生效 |
| **M3** | 清理引擎 + 回滚 | 清单可核对；回收量可量化；登录态与当前版本零误删 |
| **M4** | Chocolatey（UAC）+ 桌面应用跳转 + 绿色软件链接 + 设置页 | 提权能完成；桌面应用只提醒不代跑 |

证据要求见 [docs/testing.md](docs/testing.md)，完整验收见 [DESIGN.md](DESIGN.md#8-里程碑与验收标准)。

---

## 📦 获取与安装

**暂无 Release。** M0 之后由 `pnpm tauri build` 产出 NSIS / MSI；未签名，首次运行会有 SmartScreen 提示（与同类自更新工具相同）。

前提（本机已验证）：Windows 11 x64 · MSVC 14.44 + VS2019 BuildTools · Windows SDK 19041+ · WebView2 153 · Node 24 / npm 12 · G: 剩余 127 GB；**Rust 工具链未装**（M0 安装，约 1.5–2 GB）。

> ⚠️ `rustup` 与 `cargo` 不读 Windows 系统代理，首次构建前给该进程导出 `HTTPS_PROXY` 或换镜像源，步骤见 [docs/development.md](docs/development.md#bootstrap-without-a-working-system-proxy)。

---

## 🧰 快速开始（从源码运行）

以下命令由 M0 建立；今天 clone 下来只有文档与契约。

```powershell
# git 与 rustup/cargo 都不自动走系统代理，先从注册表读出导出给本进程
$proxy = (Get-ItemProperty 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings').ProxyServer
$env:HTTPS_PROXY = "http://$proxy"; $env:HTTP_PROXY = $env:HTTPS_PROXY

git clone https://github.com/JESVN/upkeeper.git
cd upkeeper
pnpm install
pnpm tauri dev
```

日常命令：`pnpm tauri build` 打包 · `pnpm typecheck` / `pnpm test` 前端 · `cargo fmt --check` / `cargo clippy -- -D warnings` / `cargo test`（在 `src-tauri/` 内执行）· `pnpm run doc-budgets` 校验文档字数上限。

---

## ❓ 常见问题 FAQ

**会帮我自动更新 PiDeck、CC Switch 这类桌面应用吗？** 不会，这是设计上的拒绝：桌面应用的自更新要在它自己的安装目录里落文件，插手就要与它的更新器抢同一个目录，只为省一次点击。

**清理会误删登录态或配置吗？** 不会。只删 glob 明确匹配的条目（绝不整目录乱删）、目标进程在跑就整条跳过、登录态用 `protect` 显式保护、默认 dry-run 先看清单。性质未定的目录（如 `%LOCALAPPDATA%\com.ccswitch.desktop`）在查清前不进任何规则。

**topgrade / UniGetUI / Scoop 已经能更新了，为什么还造一个？** 它们覆盖不了「更新残留」这一半 —— 最大的一堆垃圾恰恰来自那些不由包管理器安装的桌面应用。

**需要管理员权限吗？** 只有 Chocolatey 操作需要，会事先说明并弹一次 UAC；设成 `uac: mark-only` 则改为把命令交给你自己跑。

**会收集我的数据吗？** 不会，无账号、无遥测、无云端。

**出问题怎么排查？** 每个应用每次运行都有自己的日志（`%LOCALAPPDATA%\Upkeep\logs\`），失败行可直接打开；与 `omp-clean.ps1` 这类既有脚本的行为不一致时按 bug 处理。

---

## 🔒 安全与隐私

- 代理只注入子进程：每次运行实时读注册表，不写注册表、不改父进程环境、端口不写死。
- 子进程 stdin 恒为 null，输出剥掉 ANSI 才进日志与界面；提权结果经临时文件回传（UAC 会切断管道）。
- `state.json`、`history.jsonl`、日志与回滚副本都在 `%LOCALAPPDATA%\Upkeep`，不随仓库提交。

---

## 🧑‍💻 开发指南

动手前先读 [AGENTS.md](AGENTS.md)（常驻规则）与 [docs/architecture.md](docs/architecture.md)。三条硬要求：

- 未核实的东西不进 [config/apps.yaml](config/apps.yaml)：版本源没经探测确认就保持 `# TBD`，界面显示「未知」，不许猜。
- 非平凡改动在同一改动里补一篇 [Agent Note](.agents/notes/README.md)，文档与代码同改。
- 会删除文件的改动先过 [cleanup-safety-review](.agents/skills/upkeeper-cleanup-safety-review/SKILL.md)；提交前按 [pre-push-checks](.agents/skills/upkeeper-pre-push-checks/SKILL.md) 选最小充分证据，并如实报告「未运行」的项。

---

## 📚 文档地图

| 想了解 | 看这里 |
|---|---|
| 常驻规则、设计记录、调研与取舍 | [AGENTS.md](AGENTS.md) · [DESIGN.md](DESIGN.md) |
| 分层、七段流水线、IPC 表 | [docs/architecture.md](docs/architecture.md) |
| 本机实测：清单、路径、残留、代理行为 | [docs/environment.md](docs/environment.md) |
| 执行安全与清理规则 | [docs/execution-safety.md](docs/execution-safety.md) · [docs/cleanup-rules.md](docs/cleanup-rules.md) |
| 配置字段、Provider 契约、界面、开发与验证 | [docs/config-schema.md](docs/config-schema.md) · [docs/providers.md](docs/providers.md) · [docs/ui.md](docs/ui.md) · [docs/development.md](docs/development.md) · [docs/testing.md](docs/testing.md) |
| 操作手册、故障故事、应用登记表 | [docs/cookbook/](docs/cookbook/README.md) · [docs/postmortem/](docs/postmortem/README.md) · [config/apps.yaml](config/apps.yaml) |

---

## 🤝 参与贡献

欢迎 issue 与 PR。先读 [AGENTS.md](AGENTS.md) —— 那些规则是边界而不是风格建议；改动请带上证据（新清理规则要有量出来的字节数，新版本源要有探测结果）；觉得某条规则不对就推翻它，但要在 `.agents/notes/` 里写清为什么，别悄悄绕过去。

---

## 📄 License

仓库没有 `LICENSE`，默认保留所有权利；要让别人可复用、修改或分发，需要先补一份许可证。
