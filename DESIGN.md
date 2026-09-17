# Upkeep 设计文档

| | |
|---|---|
| 版本 | v0.3（已冻结） |
| 日期 | 2026-09-17 |
| 目标平台 | Windows 11（x64） |
| 项目路径 | `G:\AIProjects\upkeeper` |
| 技术栈 | Tauri v2 (Rust) + React 19 + Vite + TypeScript + Tailwind v4 |
| 状态 | **已冻结**：M0 动工起正文不再修改，后续设计改动进 [Agent Note](.agents/notes/README.md) 与 `docs/` |

---

## 1. 目标与非目标

### 目标
把本机形态各异的应用更新与"更新残留清理"收敛到一个统一的桌面界面里，解决四件事：

1. **看得见**：一屏看到哪些应用有新版本（当前版本 vs 最新版本）。
2. **一键更新**：能自动更新的形态批量更新，带实时进度、代理注入与 UAC 提权。
3. **残留清理**：把各更新器留下的垃圾（实测约 661 MB）纳管，安全地回收。
4. **接得进（万能）**：任何更新方式都能纳管 —— 加一个应用只改 `apps.yaml`，不改代码；本机还没有的生态也只加一行管理器表。

### 非目标
- 不做 Electron/Tauri 桌面应用的**静默驱动更新**（已决定：只检测 + 提醒 + 一键跳转）。
- 不做跨平台（仅 Windows）。
- 不做应用商店 / 分发平台。
- 不替代包管理器本身（winget / choco / npm / pnpm / uv … 的更新仍由它们的官方命令执行，Upkeep 只负责挑、跑、记账与清理）。

---

## 2. 背景：本机实测事实（设计依据）

> 以下数据均为 2026-09-17 在本机实测所得，是全部设计决策的依据。

### 2.1 本机更新形态（实测清单；**形态集是开放的**）

> 这张表是**本机今天的样子**，不是 Upkeep 的能力上限：形态（机制）可扩展，应用与生态由配置表达（见 4.1、4.3）。

| 形态 | 实例 | 当前版本发现方式 | 更新执行 | 可否自动 |
|---|---|---|---|---|
| `manager`：winget | **本机 459 个应用被识别、83 个可升级**：CC Switch（`farion1231.CC-Switch`）、Tuanjie Hub、夸克网盘、7-Zip、Git、VS Code、Docker Desktop… | `winget list` / `winget upgrade` | `winget upgrade --id <id>` | ✅ 部分需 UAC |
| `manager`：npm | copilot、mcporter、opencli、agent-browser、9router…（全局共 26 包） | `npm ls -g --json` | `npm i -g <pkg>@latest` | ✅ 可自动 |
| `manager`：choco | python、vcredist140、chocolatey 自身（9 个待升级） | `choco outdated --limit-output` | `choco upgrade` | ✅ 需 UAC |
| `manager`：pnpm / uv / dotnet / pip / go | pnpm 11.9.0、uv 0.11.7、dotnet 10.0.204（csharpier 0.25.0）、pip 26.1.1、go 1.24.5 | 各自的 list 命令 | 各自的 upgrade / install | ✅ 可自动 |
| `self-update-cli` | omp、pi、codex、claude | `<cli> --version` + regex | `update` / `update self` | ✅ 可自动 |
| `external-ui` | PiDeck（`ayuayue/PiDeck`）、Cockpit Tools、Tuanjie Cowork、Clash Verge | exe 文件版本（或 winget 的 ARP 条目） | 应用内自更新（下 NSIS 到 TEMP 再静默装） | ❌ 只检测+提醒 |
| `green` | BCompare、Apifox、Burp | exe 文件版本 | 手动下载 | ❌ 只检测+给链接 |
| `declarative` | 任何能用命令表达的更新方式（**万能兜底**） | 配置里的命令 + regex | 配置里的命令 | 取决于配置 |

具体安装位置（实测）：

| 应用 | 路径 | 版本 |
|---|---|---|
| omp | `%LOCALAPPDATA%\omp\omp.exe` | 18.2.4 |
| pi | npm 全局（`%APPDATA%\npm\pi`） | 0.85.1 |
| PiDeck | `%LOCALAPPDATA%\Programs\PiDeck\PiDeck.exe` | 0.7.6 |
| CC Switch | `G:\CC Switch\cc-switch.exe` | 3.20.3 |
| winget | `%LOCALAPPDATA%\Microsoft\WindowsApps\winget.exe`（**不在 PATH**，`cmd` 里找不到） | 1.29.290 |
| choco | `C:\ProgramData\chocolatey\bin\choco` | 2.2.2 |

### 2.2 更新残留（最大收益点）

| 来源 | 路径模式 | 实测规模 |
|---|---|---|
| Tauri 更新器 | `%TEMP%\<App>-<ver>-updater-<rand>` | **53 个目录 / 410 MB**（CC Switch 17、Cockpit Tools 12、Tuanjie Cowork 20、Clash Verge 3、Quark 1） |
| electron-updater | `%LOCALAPPDATA%\pi-desktop-updater\` | **251 MB** |
| 自更新 exe | `%LOCALAPPDATA%\omp\omp.exe.*.bak` | 202 MB / 次更新 |
| 运行时原生模块 | `%USERPROFILE%\.omp\natives\<ver>\` | 172 MB / 次更新（旧版本） |
| Squirrel | `%LOCALAPPDATA%\SquirrelTemp` | 92 KB |
| **合计立即可回收** | | **≈ 661 MB** |

> 注：`%LOCALAPPDATA%\com.ccswitch.desktop`（147 MB）是 CC Switch 的**应用数据目录**而非更新残留，需甄别后再决定是否清理（可能含配置）。

### 2.3 网络约束（决定执行层设计）

| 工具 | 是否读系统代理 | 实测结果 |
|---|---|---|
| `.NET`（Invoke-WebRequest / HttpWebRequest） | ✅ 自动继承 | 稳定可用（曾用它在 12.7s 下完 161MB） |
| `gh` CLI | ❌ | 必须显式导出 `HTTPS_PROXY` 才通 |
| `omp`（Bun fetch） | ❌ | 直连 GitHub Release 会超时（15 分钟硬上限）→ 必须注入 env |
| `curl` | ❌ | **完全不可用**（直连与经代理均返回 HTTP=000） |
| 系统代理 | — | 注册表 `HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings` → `ProxyEnable=1`，`ProxyServer=127.0.0.1:10808`（xray，进程 PID 会轮换，端口可能变） |

**结论**：Upkeep 自身 HTTP 必须"读注册表 → 显式使用代理"；给子进程注入代理时**只注入该子进程**，不污染父进程环境与注册表。

---

## 3. 总体架构

```
┌──────────────── UI (React + Vite + TS + Tailwind) ────────────────┐
│ ①应用列表+版本对比 ②批量操作+实时进度 ③残留清理面板                │
│ ④设置页 ⑤历史记录 ⑥桌面应用提醒+一键跳转                          │
└───────────────────────────┬──────────────────────────────────────┘
                            │ Tauri IPC (commands + events)
┌───────────────────────────▼──────────────────────────────────────┐
│                     Core (Rust, src-tauri)                       │
│                                                                  │
│  config ─► scan ─► plan ─► exec ─► verify ─► clean ─► history     │
│  (apps.yaml) │      │      │        │         │         │         │
│              │      │      │        │         │         └ JSONL   │
│              │      │      │        │         └ 清理规则引擎       │
│              │      │      │        └ 版本 / 哈希断言             │
│              │      │      └ 代理注入·UAC·超时·ANSI·stdin=null    │
│              │      └ 需更新? 提权? 代理? 需关进程?                │
│              └ providers/*（机制各一实现；应用与生态由配置表达）    │
│                                                                  │
│ proxy(winreg) · http(reqwest) · proc(sysinfo) · elevate(ShellExecuteW) │
└──────────────────────────────────────────────────────────────────┘
```

**数据流**：UI `invoke("scan")` → Core 并行扫描 → 通过 `emit("scan://progress")` 流式回推 → UI 增量渲染。
更新与清理同理：`update://progress`、`clean://progress`。发现候选同理：`invoke("discover")` 只读枚举 → UI 勾选 → `adopt` 追加写入用户级 `apps.yaml`。

**分层原则**：UI 只做展示与选择；一切副作用（spawn 进程、删文件、提权）只在 Core 发生，且都要经过"计划 → 预览 → 执行"三段。

---

## 4. 核心抽象

### 4.1 Provider trait

```rust
#[async_trait]
pub trait Provider: Send + Sync {
    fn id(&self) -> &str;
    fn form(&self) -> Form;                                    // 决定 UI 分组与回滚策略
    async fn detect(&self, ctx: &Ctx) -> Result<Installed>;     // 当前版本
    async fn latest(&self, ctx: &Ctx) -> Result<Option<String>>;
    fn plan(&self, i: &Installed, l: &Option<String>) -> Plan;  // 需更新? 提权? 代理? 关进程?
    async fn update(&self, ctx: &Ctx, p: &Plan) -> Result<Outcome>;
    fn cleanup_rules(&self) -> Vec<Rule>;
    fn rollback(&self, ctx: &Ctx, to: &str) -> Result<Outcome> { Err(Error::Unsupported) }
}
```

设计参考：gup 的"1 provider = 1 文件 + 少量方法契约"，但补上 gup 缺失的**清理钩子**与**回滚**。

**形态是「机制」，不是「应用清单」。** `Form` 只有五类机制，应用数量、生态数量都不受它限制：

| 机制 | 覆盖 | 新增成本 |
|---|---|---|
| `manager` | 包管理器 / 生态管理器：winget、npm、pnpm、bun、yarn、scoop、choco、pip、pipx、uv、dotnet tool、cargo、go install | **加一行管理器表**（十几行） |
| `self-update-cli` | 工具自带更新命令（`omp update`、`pi update self`…） | 配置；仅当机制本身是新的才写文件 |
| `external-ui` | 带自己更新器的桌面应用：只检测 + 徽标 + 跳转 | 配置 |
| `green` | 绿色 / 便携软件：检测 + 给下载页 | 配置 |
| `declarative` | **万能兜底**：detect 命令 + regex、来源链、update 命令 + 参数、verify、cleanup 全部写在 `apps.yaml` | **零代码** |

于是三种成本被分开：**加一个应用 = 改配置；加一个生态 = 加一行管理器表；加一种全新机制 = 写一个 provider 文件（罕见）**。

管理器表每行声明：list 命令与解析、upgrade 命令模板、包 id 字段、是否需提权、是否需注入代理、静默参数。本机实测已装：winget（459 个应用被识别 / 83 个可升级）、npm（26 包）、pnpm、choco（9 个待升级）、uv、dotnet tool、pip、go；未装：scoop、pipx、bun、yarn、cargo、nuget（装了就等于多一行表）。

### 4.2 配置文件 `apps.yaml`

```yaml
version: 1
settings:
  proxy: system            # system | none | "http://127.0.0.1:10808"
  concurrency: 4
  timeout_s: 900
  on_failure: continue     # continue | stop
  retention: auto          # auto = 仅"无法在线回滚"的形态保留 1 个版本
  uac: allow               # allow | mark-only
  notify: toast

apps:
  - id: omp
    form: self-update-cli
    detect: { exe: "%LOCALAPPDATA%\\omp\\omp.exe", args: ["--version"], regex: "omp/([\\d.]+)" }
    latest: { kind: self-check, args: ["update", "--check"] }
    update: { args: ["update"], needs_proxy: true, preflight: true, eta_guard_min: 14 }
    verify: { expect: changed, sha256_from: "github:can1357/oh-my-pi" }
    cleanup:
      - { glob: "%LOCALAPPDATA%\\omp\\omp.exe.*.bak", keep_newest: 0 }
      - { glob: "%LOCALAPPDATA%\\omp\\natives\\*", keep_matching_version: true }
      - glob: "%USERPROFILE%\\.omp\\run\\daemons\\*\\omp.browser.headless.profile\\*"
        only: ["optimization_guide_model_store","component_crx_cache","WasmTtsEngine",
               "GrShaderCache","ShaderCache","GPUCache","Code Cache","Cache"]
        protect: ["Default"]
        skip_if_running: ["omp.exe"]

  - id: pi
    form: manager
    manager: npm
    package: "@earendil-works/pi-coding-agent"
    prefer: self-update                                  # 有自带更新器时优先用它
    update: { args: ["update", "self"], fallback: "npm" }

  - id: pideck
    form: external-ui
    kind: electron
    detect: { exe: "%LOCALAPPDATA%\\Programs\\PiDeck\\PiDeck.exe" }
    latest: { kind: github, repo: "ayuayue/PiDeck" }
    actions: [open-app, open-release-page]
    cleanup:
      - { glob: "%LOCALAPPDATA%\\pi-desktop-updater\\**", older_than_days: 7, skip_if_running: ["PiDeck.exe"] }

  - id: cc-switch
    form: external-ui                                   # 应用自己更新；winget 作版本来源与备用更新手段
    kind: tauri
    manager: winget
    package: "farion1231.CC-Switch"                     # 实测：winget 里就是这个 id
    detect: { exe: "G:\\CC Switch\\cc-switch.exe" }
    latest:
      - { kind: winget }
      - { kind: github, repo: "TBD" }                   # TBD：winget id 的作者名为 farion1231，需核实仓名
    actions: [open-app, open-release-page]
    cleanup:
      - { glob: "%TEMP%\\CC Switch-*-updater-*", keep_newest: 0, quiet_period_s: 300, skip_if_running: ["cc-switch.exe"] }

  - id: choco-python
    form: manager
    manager: choco
    package: python
    update: { needs_admin: true }

  - id: bcompare
    form: green
    detect: { exe: "E:\\Beyond_Compare_4.4.6.27483_64bit_Green\\BCompare\\BCompare.exe" }
    latest: { kind: url_regex, url: "TBD", regex: "TBD" }
    actions: [open-download-page]

  # —— 生态管理器：本机 winget 里有清单的应用，加一行就纳管 ——
  - id: 7zip
    form: manager
    manager: winget
    package: "7zip.7zip"                                 # 实测：24.09 → 26.03

  # —— 万能兜底：任何能用命令表达的更新方式，零代码 ——
  - id: my-tool
    form: declarative
    detect: { command: "my-tool", args: ["version"], regex: "v?([\\d.]+)" }
    latest:
      - { kind: url_regex, url: "https://example.com/download", regex: "my-tool-([\\d.]+)\\.zip" }
    update: { command: "my-tool", args: ["self-update"], needs_proxy: true }
    verify: { expect: changed }
```

### 4.3 发现候选（discovery）

"万能"还要求在纳管一个应用时不必先知道它的机制。`discover` 是**只读**命令，枚举候选：

| 候选来源 | 得到 | 备注 |
|---|---|---|
| `winget list` | 名称、id、已装版本、来源（winget / ARP） | 本机 459 条；ARP 条目能看出版本但没有"可用版本" |
| 各管理器的 list | 包名 + 已装版本 | npm / pnpm / choco / uv / dotnet / pip / go |
| 注册表卸载项 | 名称、版本、安装位置 | 本机约 793 条，用来推断 exe 以读版本资源 |
| `%LOCALAPPDATA%\Programs`、`Program Files` | exe 路径 + 版本资源 | 绿色 / 便携软件 |

候选只呈现，不写盘；用户勾选"纳管"后才**追加到用户级 `%LOCALAPPDATA%\Upkeep\apps.yaml`**（出厂 `config/apps.yaml` 不动）。发现同样只在用户点"发现应用"时运行 —— 与 5.1 的契约一致：没有用户发起的动作，就没有网络请求与子进程。

---

## 5. 模块设计

### 5.1 扫描（scan）
- **扫描只由用户发起。** 点「检查更新」才跑；启动、窗口聚焦、定时轮询、后台任务都不扫描。
- 启动时渲染上一次的结果（`state.json` 的 `checked_at`）并标注「检查于 X 前」；从未检查过则列表为空态，只给一个「检查更新」引导。
- 由此可保证：**在用户开口之前，Upkeep 不发生任何无人值守的网络请求与子进程** —— 不请求 registry / GitHub，也不起 `<cli> --version`。
- 并行度默认 4（可配）；每个 provider 独立 `tokio::time::timeout`。
- **失败隔离**：单个 provider 失败只让该行变红，不影响其它（借鉴 gup 的"只坏自己一格"）。
- 结果写入 `state.json`（含 `checked_at`）；缓存只用于展示新鲜度，不用来决定"要不要更新"。
- **单行刷新**：每行可单独重查（`scan` 带 `apps: [id]`），只跑这一个 provider，其它行的已记录结果不变；失败行上的「重试」就是同一个动作。

### 5.2 版本来源（latest）

| kind | 实现 | 备注 |
|---|---|---|
| `winget` | `winget list --id <id>` / `winget upgrade` | 一次拿到全部待升级；**winget 自己读系统代理，无需注入** |
| `manager` | 该管理器自己的 list / outdated | 与 detect 共用一次调用 |
| `github` | `GET /repos/{repo}/releases/latest` → `tag_name` | 走显式代理；可用 `GITHUB_TOKEN` 提额 |
| `npm` | `GET registry.npmjs.org/{pkg}/latest` → `version` | |
| `self-check` | 跑 `<cli> update --check` 并解析 | omp 支持 |
| `choco` | `choco outdated --limit-output` | 一次拿到全部待升级 |
| `file-version` | 读 exe 的 `VS_VERSION_INFO` | 桌面应用的当前版本 |
| `url_regex` | 拉页面 + 正则 | 绿色软件兜底；失效只影响该行 |

`latest` 接受**有序来源链**：写成列表时按顺序尝试，第一个给出可用版本的来源胜出（例：先 `winget`，再 `github`，最后 `url_regex`）；单个 map 是单元素链的简写。这样"万能"不依赖任何单一来源：应用在 winget 里有清单就用它，没有就回落到 GitHub release 或厂商页面。

### 5.3 执行层（把本项目踩过的坑固化为规范）

| 要求 | 实现方式 | 来源（已验证的教训） |
|---|---|---|
| 代理只给子进程 | `Command::env("HTTPS_PROXY", …)`；父进程环境与注册表均不变 | omp 更新失败根因 |
| 预检 + ETA 预警 | 更新前小范围探测，按实测速度与资产大小估算；超阈值先提示换节点 | omp 15 分钟超时 |
| 绝不进交互 | `Stdio::null()` 作为 stdin | 缺参数时 omp 会误启 TUI 并 exit 129 |
| 输出清洁 | 剥离 ANSI 转义后再进日志与 UI | TUI 转义序列污染日志 |
| 超时与中断 | 每 provider 独立超时；UI「停止」杀整个进程树 | — |
| UAC 提权 | `ShellExecuteW("runas")` 拉起提权助手，输出经临时文件回收 | UAC 会隔断管道（gup 用 JSONL 解决） |
| 前置检查 | `skip_if_running` / `must_close`：检测进程 → UI 提示 → 由用户决定强关或跳过 | Windows 文件占用 0x80073D02 |

### 5.4 清理引擎（clean）

```rust
struct Rule {
    glob: String,                      // 必填：白名单匹配
    keep_newest: Option<u32>,          // 保留最新 N 个
    older_than_days: Option<u32>,      // 或按时间
    keep_matching_version: bool,       // 与"已安装版本"比对（native 类专用）
    only: Vec<String>,                 // 进一步限定子项名
    protect: Vec<String>,              // 永不触碰的子路径（如浏览器 Default/ 登录态）
    skip_if_running: Vec<String>,      // 进程守卫
    quiet_period_s: Option<u64>,       // 最近 N 秒被写过则不动（防更新进行中）
}
```

**三条硬规则**（沿用已在 `omp-clean.ps1` 验证过的安全设计）：

1. **只删匹配 glob（且属于 `only`）的条目** —— 绝不整目录删除。
2. **目标应用正在运行 → 整条规则跳过**（不是只跳过文件）。
3. **默认 dry-run** —— UI 先列出"将删除什么、共多少字节"，用户确认后才执行。

### 5.5 回滚（retention: auto）

| 形态 | 策略 | UI 标识 | 空间代价 |
|---|---|---|---|
| `SelfUpdateCli`（omp 类） | 更新前把旧 exe 复制到 `rollback\<ver>\` | 「可回滚」 | ~200 MB/应用 |
| `ExternalUi` | 不由我们驱动更新 → 无副本 | 「需重装回滚」 | 0 |
| `NpmGlobal` | 不留副本；回滚 = `npm i -g <pkg>@<ver>` | 「可在线回滚」 | 0 |
| `Choco` | 不留副本；回滚 = `choco install <pkg> --version=<ver>` | 「可在线回滚」 | 0 |
| `Green` | 不留副本 | 「手动」 | 0 |

### 5.6 历史与状态（history）

- `%LOCALAPPDATA%\Upkeep\history.jsonl` —— 追加写，字段：
  `{ ts, app_id, action, from, to, result, duration_ms, exit_code, log_path }`
- `%LOCALAPPDATA%\Upkeep\state.json` —— 各应用最近检查时间、缓存的最新版本。
- 日志按 provider 分文件，失败可一键打开。

### 5.7 通知（toast）

`tauri-plugin-notification`。通知只用于**用户自己发起的动作收尾**（如「更新完成：3 成功 / 1 失败」），不存在"发现新版本"这类后台通知 —— 因为没有后台扫描（见 5.1）。Windows 要求非打包应用有稳定 AppId，实现方式：安装时创建开始菜单快捷方式并由其提供 AppId（这是原生 toast 的硬性前提，需在打包阶段处理）。

---

## 6. UI 设计

```
┌ Upkeep ───────────────────────[检查更新][全选可更新][更新选中][清理]┐
│ ┌ 应用（12） ────────────────┬─ 待更新 5 ─ 可清理 661MB ──────────┐ │
│ │ ☐ omp        18.2.3 → 18.2.4  [更新]  可回滚                       │ │
│ │ ☐ pi         0.85.1 → 0.86.0  [更新]  可在线回滚                   │ │
│ │ ☐ PiDeck     1.4.2  → 1.5.0   [打开应用][下载页]  需重装回滚        │ │
│ │ ☐ BCompare   4.4.6  → 4.5.0   [下载页]                             │ │
│ │ ── 已是最新（7）───────────────────────────────────────────────── │ │
│ └───────────────────────────────────────────────────────────────────┘ │
│ ┌ 进度 / 日志 ─────────────────────────────────────────────────────┐ │
│ │ ████████░░ omp   下载中 62%  3.9 MB/s  ETA 0:38                  │ │
│ │ ✓ pi    0.85.1 → 0.86.0   12.4s                                  │ │
│ │ ✗ choco 需要管理员权限（已跳过）                                   │ │
│ └──────────────────────────────────────────────────────────────────┘ │
│ [残留清理 (661MB)]   [设置]   [历史]   [发现应用]                     │
└──────────────────────────────────────────────────────────────────────┘
```

图中列表是用户点过「检查更新」之后的样子：**默认不勾选任何行**，勾选只表示选中，点「更新选中」才执行；「全选可更新」也只勾选、不执行；每行另有一个 `[刷新]`，只重查该行。从未检查过时列表是空的，只显示「检查更新」引导和上次结果的新鲜度。

七个板块（均已确认要做）：

1. **应用列表 + 版本对比**：当前/最新版本、状态徽标（待更新 / 最新 / 未知 / 失败）、可排序与筛选、每行可单独刷新。**不做任何自动扫描**：启动渲染上次结果与新鲜度，从未检查过则为空态。
2. **批量操作 + 实时进度**：检查更新 / 全选可更新 / 更新选中 / 单行更新；**更新目标永远来自用户的手动勾选或点击**，不存在自动勾选、自动更新或启动即更新；逐条进度、失败原因、可中止。
3. **残留清理面板**：逐规则显示 `匹配数 → 大小`；默认不勾选任何规则，勾选后执行；**永远先预览**。
4. **设置页**：代理（system/自定义）、并发、超时、保留策略、UAC 策略、每应用启用开关。
5. **历史记录**：何时从什么版本升到什么版本、成功/失败、耗时、日志入口。
6. **桌面应用行**：黄色"待更新"徽标 + `[打开应用]`（ShellExecute）+ `[下载页]`，**绝不代跑安装器**。
7. **添加应用（发现候选）**：点「发现应用」→ 列出候选（名称 / 已装版本 / 证据来源 / 建议的形态）→ 勾选「纳管」→ 追加到用户级 `apps.yaml`；也可以直接手写一条 `declarative` 条目。全程只读，直到用户确认。

---

## 7. 技术栈与依赖

| 层 | 选型 |
|---|---|
| 外壳 | Tauri v2 |
| 前端 | React 19 + Vite + TypeScript + Tailwind v4 |
| Rust crates | `tokio`、`reqwest`、`serde` / `serde_yaml`、`globset`、`sysinfo`、`winreg`、`sha2`、`pelite`（读 exe 版本）、`tauri-plugin-notification`、`tauri-plugin-opener` |
| 打包 | `tauri build` → NSIS / MSI（未签名会有 SmartScreen 提示，与现有 omp 情况相同） |

### 7.1 环境前提（本机实测）

| 前提 | 状态 |
|---|---|
| MSVC 链接器 | ✅ VS 2022 Community（MSVC 14.44）+ VS 2019 BuildTools（14.29） |
| Windows SDK | ✅ 10.0.19041 / 22621 / 26100 |
| WebView2 运行时 | ✅ 153.0.4234.32 |
| Node / npm | ✅ v24.18.0 / 12.0.0 |
| 磁盘 | ✅ G: 剩 127 GB（Rust 编译产物约 3~5 GB） |
| **Rust 工具链** | ❌ **未安装**（rustup，约 1.5~2 GB） |

> **重要**：`rustup` 从 `static.rust-lang.org` 下载、`cargo` 从 `crates.io` 拉包，**两者都不读 Windows 系统代理** —— 与本机 `omp update` 的失败同源。M0 必须先解决：给这两个进程注入 `HTTPS_PROXY`（只对该进程），或改配清华 / RsProxy 镜像源。

---

## 8. 里程碑与验收标准

| 阶段 | 交付内容 | 验收标准 |
|---|---|---|
| **M0** | rustup + cargo 代理/镜像配置；Tauri 脚手架 | `cargo tauri dev` 能起窗口 |
| **M1** | **只读**扫描 + 应用列表 + 版本对比 + 历史 + toast | 12 个应用全部正确报出版本；**全程不修改任何文件**（可用文件哈希自证） |
| **M2** | 批量更新（`SelfUpdateCli` + `NpmGlobal`）+ 实时进度 + 代理注入 | omp/pi 可一键升级；父进程环境无代理残留；失败隔离生效 |
| **M3** | 清理引擎 + 回滚 | 先产出 661 MB 清单；执行后回收量可量化；登录态与当前版本零误删 |
| **M4** | Choco（UAC）+ 桌面应用提醒跳转 + 绿色软件链接 + 设置页完善 | choco 能提权完成；桌面应用只提醒、不代跑安装器 |
| **M5** | **万能接入**：管理器表（winget 优先，含 pnpm / uv / dotnet / pip / go）+ `declarative` 形式 + 发现候选 | winget 能升级的应用可一键纳管；加一个应用只改配置；发现结果不写盘直到用户确认 |

---

## 9. 风险与未决问题

| # | 风险 / 未决项 | 对策 |
|---|---|---|
| 1 | 首次 `cargo build` 需下载数百 crates，可能被墙 | M0 配好代理或镜像；失败可换源重试 |
| 2 | 部分桌面应用的"最新版本源"未核实（CC Switch / Cockpit Tools / Tuanjie Cowork 的仓库地址） | 列为 M1 任务，用 `gh` + 官网核实后写入 `apps.yaml` |
| 3 | 绿色软件的 URL+正则易失效 | 只做"检测 + 给链接"；失效仅该行变灰 |
| 4 | Tauri 未签名 → SmartScreen 拦截 | 与现有 omp 相同；必要时再研究自签 |
| 5 | 提权子进程输出回收 | 临时文件 + JSONL，避免 UAC 隔断管道 |
| 6 | 与已有 `omp-clean.ps1` / `omp-maintain.ps1` 功能重叠 | **保留二者**作为 CLI 兜底与行为基准；Upkeep 结果不一致时用于对照，不删除 |
| 7 | 系统代理端口可能变化（xray 进程 PID 轮换） | 每次运行都从注册表实时读取，不写死端口 |
| 8 | `%LOCALAPPDATA%\com.ccswitch.desktop`（147 MB）性质未定 | 需甄别是缓存还是配置，确认前不纳入清理 |
| 9 | winget 只能用 `%LOCALAPPDATA%\Microsoft\WindowsApps\winget.exe` 调用（不在 PATH，`cmd` 里找不到）；源索引需要能出网 | 平台层按别名绝对路径解析；找不到就只把它当发现来源，不当作更新手段 |
| 10 | 大量应用只有 ARP 条目、没有 winget 清单（PiDeck / Cockpit Tools / Tuanjie Cowork）：winget 能看出版本但没有"可用版本" | 这些走 `external-ui` / `green` + `github` / `url_regex` 来源链；发现候选要如实标注"只能提醒" |
| 11 | 发现候选可能几百条，挑起来费劲 | 候选默认按"有可用版本 / 可无人值守"排序并分组，只列尚未纳管的 |

---

## 10. 参考项目（均已用 `gh` 核实 star 与活跃度）

| 项目 | 实测数据 | 借鉴点 |
|---|---|---|
| https://github.com/LINDECKER-Charles/gup | 3★ · TypeScript · 2026-09-05 | **最贴题**：1 provider = 1 文件的四方法契约；失败隔离、强制超时、JSONL 追加日志（解决提权后父子进程并发写）。项目极新，仅作设计参考 |
| https://github.com/topgrade-rs/topgrade | 4,543★ · Rust · 2026-09-17 | 更新钩子的一等公民：`[pre_commands]` / `[post_commands]` / `[commands]` + `--dry-run`；其 `--cleanup` 是全局阶段而非 per-app |
| https://github.com/Devolutions/UniGetUI | 26,152★ · C# · 2026-09-17 | Windows GUI 参考：按包跳过版本、操作历史、内建自更新；但只认它支持的包管理器 |
| https://github.com/aquaproj/aqua | 1,843★ · Go · 2026-09-17 | registry YAML 声明下载 + **校验和验证**；`aqua.yaml` 只写意图与版本约束 |
| https://github.com/ScoopInstaller/Scoop | 24,665★ · PowerShell | `scoop cleanup` 删旧版留最新 + `cache tidy` 更新后自动清缓存 |
| https://github.com/chocolatey/choco | 11,504★ · C# | `chocolateyBeforeModify.ps1` 钩子机制 |
| https://github.com/fptbb/fp-appimage-updater | 4★ · Rust · **已归档** | "每 app 一份 YAML recipe + strategy 含 script 逃生口"的形状值得借鉴，项目已停更 |
| https://github.com/uniget-org/cli | 24★ · Go · mirror 仓 | 定位相近但重合度低 |

**未核实线索**（来自检索，未逐个验证，仅供参考）：`electron-builder` 关于更新残留长期未修的 issue（#8730 / #6269）；`astral-sh/uv` 自更新不读 `HTTPS_PROXY` 的 issue（#10709）。

**结论**：没有现成项目能同时满足「异构应用形态 + 跨形态清理钩子 + Windows」，因此自研；但复用 gup 的 provider 契约、topgrade 的钩子思想、Scoop 的清理策略。winget 不是竞品而是**被纳管的主力机制**：本机实测它认得出 459 条、能升级 83 条，但它对只有 ARP 条目的应用（PiDeck / Cockpit Tools / Tuanjie Cowork）只能看版本不能升级，且完全不管更新残留 —— 这两块正是 Upkeep 的存在理由。

---

## 附录 A：本机应用清单（实测，M1 的初始 `apps.yaml` 依据）

**`self-update-cli`**
- omp 18.2.4 — `%LOCALAPPDATA%\omp\omp.exe` — `omp update`（需代理）
- pi 0.85.1 — npm 全局 — `pi update [source|self|pi]`
- codex 0.154.0 — npm 全局 — `codex update`
- claude-code 2.1.274 — npm 全局 — `claude update|upgrade`

**`manager`: winget**（本机 459 个应用被识别 / 83 个可升级；这是"万能"的主力）
- CC Switch `farion1231.CC-Switch` 3.20.3、Tuanjie Hub `Unity.TunjieHub` 1.3.7、夸克网盘 `Alibaba.Quark` 6.9.6.896、7-Zip、Git、VS Code、Docker Desktop、Node.js、OBS、LibreOffice…

**`manager`: npm**（26 个，重点：copilot 0.0.362、mcporter 0.9.0、opencli 1.8.7、agent-browser 0.27.0、9router 0.4.71、context-mode 1.0.169、model-verity 0.2.0）

**`manager`: choco**（2.2.2；待升级 9 个：chocolatey 2.2.2→2.7.4、python 3.11.4→3.14.7、vcredist140 14.32→14.51、visualstudio2019buildtools 16.11.17→16.11.60…）

**`manager`: 其它已装生态**
- pnpm 11.9.0（全局 bin `%LOCALAPPDATA%\pnpm\bin` 未在 PATH）、uv 0.11.7（暂无工具）、dotnet 10.0.204（csharpier 0.25.0）、pip 26.1.1（`C:\Python311`）、go 1.24.5
- 未装：scoop、pipx、bun、yarn、cargo、nuget

**`external-ui`**（winget 只能看出版本，没有可用版本）
- PiDeck — Electron，`ayuayue/PiDeck`（实测最新 `v0.7.6` = 已装 0.7.6），更新缓存 `%LOCALAPPDATA%\pi-desktop-updater`（262 MB）
- CC Switch — Tauri，`G:\CC Switch\`，数据目录 `%LOCALAPPDATA%\com.ccswitch.desktop`
- Clash Verge 2.3.2、Cockpit Tools 0.26.5、Tuanjie Cowork 2.1.1-canary.3

**`green`**
- BCompare 4.4.6.27483 — `E:\Beyond_Compare_4.4.6.27483_64bit_Green\`
- Apifox 2.7.8 — `E:\Apifox\`
- Burp Suite 2026.4.3（winget 里是 `PortSwigger.BurpSuite`，2026.4.3 → 2026.7.3）

> 全机注册表卸载项约 793 条、winget 识别 459 条。Upkeep **只纳管用户主动选中的**应用：`discover` 只把候选读出来给用户挑，既不自动纳管、也不整机接管。

---

## 附录 B：清理规则初始集（实测规模）

| 规则 | 目标 | 实测可回收 |
|---|---|---|
| `tauri-updater-temp` | `%TEMP%\<App>-<ver>-updater-*` | 410 MB |
| `electron-updater-cache` | `%LOCALAPPDATA%\pi-desktop-updater\**` | 251 MB |
| `omp-bak` | `%LOCALAPPDATA%\omp\omp.exe.*.bak` | 202 MB / 次 |
| `omp-stale-natives` | `%USERPROFILE%\.omp\natives\<非当前版本>` | 172 MB / 次 |
| `squirrel-temp` | `%LOCALAPPDATA%\SquirrelTemp` | 92 KB |
| **合计（首次执行）** | | **≈ 661 MB** |

---

## 变更记录

| 版本 | 日期 | 变更 |
|---|---|---|
| v0.1 | 2026-09-17 | 初稿：完成本机盘点、方案调研、架构与里程碑设计 |
| v0.2 | 2026-09-17 | 明确「用户发起」契约：扫描只在点「检查更新」时发生（启动/聚焦/定时都不扫描），但每行可单独刷新；更新目标必须由用户手动勾选，默认不勾选任何行；通知只用于用户发起动作的收尾 |
| v0.3 | 2026-09-17 | 形态集开放：形态是「机制」而非应用清单（加应用=改配置，加生态=加一行管理器表，`declarative` 是零代码兜底）；新增 winget 等生态管理器（实测 459 个应用被识别 / 83 个可升级）；`latest` 改为有序来源链；新增 `discover`/`adopt` 发现候选与 M5 里程碑 |
| v0.3（冻结） | 2026-09-18 | M0 动工（工具链、Tauri 脚手架、三个文档门禁），按约定冻结在此版本；正文不再回改 |
