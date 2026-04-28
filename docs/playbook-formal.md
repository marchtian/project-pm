# Playbook A：正式项目协作剧本

> **适用场景**：要进生产 / 长期维护 / 多人接手 / 客户交付。
> **典型时长**：几天到几周。
> **核心原则**：宁可慢，不要返工；每个 Phase 闭环再走下一个。

---

## 〇、开新项目时直接复制粘贴的种子提示词

> 把下面这段贴给我，作为新会话第一句话。能省掉一整天的反复。

```
我想做一个 [X]，给 [Y] 用，关键能力是 [Z]，约束是 [W]。

协作规则按 docs/playbook-formal.md，重点强调：

1. 每个 Phase 完成的硬定义（DoD 三件套，缺一不可）：
   (a) `npx @steedos/validate <pkg>` → 0 errors, 0 warnings
   (b) `yarn start` 看到 boot 成功日志 + curl 健康检查 200
   (c) 我能在浏览器看到本 Phase 的功能跑过一次

2. 三件套未全部满足，不许说「Phase 完成」，更不许进下一个 Phase。
   尤其禁止把「validate 通过」单独当作完成信号。

3. 你每说一次「完成 / 通过 / OK」，必须同时贴出真实命令输出。
   想偷懒说「已验证」而不贴输出 = 违规。

4. 第一个 Phase（Phase 0）必须是「最小能跑的脚手架」，不许塞业务功能。
   Phase 0 没过 DoD 三件套之前，不许设计 Phase 1。

先按 Step 1 反问我 5–8 个关键不确定项。
```

**配套的 3 句日常追问口令**（你随时可用）：

- 「Phase N 完成了吗？把三件套真实输出贴出来。」
- 「跑起来了吗？」（专门用在我说「validate 通过」之后）
- 「现在在哪一步？」（让我指到 todo / changelog 行号）

---

## 一、定位与前提

| 维度 | 取值 |
|------|------|
| 适用项目 | 生产级、长期演进、需要他人接手 |
| 设计粒度 | 架构设计一次 + 每个 Phase 详细设计 |
| 人工卡点 | 6 处（见下表） |
| 测试要求 | 每 Phase 必有自动化测试 + 真实输出 |
| 文档要求 | requirements / architecture / data-model / changelog / ADR 全套 |
| 失败处置 | 4 条停哨（R1–R4）任一触发即停 |
| 提交粒度 | 每个模块/触发器/页面一次 commit，遵循 `<Phase>: <模块> - <动作>` |

---

## 二、6 个人工卡点

| # | 卡点位置 | 你要做什么 | 我（Claude）要做什么 |
|---|---------|-----------|--------------------|
| G1 | Step 1 → Step 2 | 给出项目种子（一段话 + 约束） | 反问澄清 5–8 个关键不确定项 |
| G2 | Step 3 架构设计后 | 审阅架构 ADR，确认或修改 | 给出可选项 + 我的推荐 + 风险 |
| G3 | 每个 Phase 的详细设计后（Step 5 末） | 审阅 design.md，签字 `design_locked: true` | 不签字不准开始编码 |
| G4 | 每个 Phase 的 Step 8 浏览器验证 | 在浏览器跑一遍核心路径，给出 PASS / FAIL | 准备好 checklist 让你按图索骥 |
| G5 | 触发停哨时 | 决定继续 / 改设计 / 推翻 Phase | 用结构化报告陈述事实，不擅自决定 |
| G6 | 全部 Phase 完成后的发布前 | 走完发布前 checklist | 整理 release notes、回归测试报告 |

---

## 三、10 步主流程

### Step 1 — 种子输入（人工）
- **你说**：「我想做一个 X，给 Y 用，关键能力是 Z，约束是 W。」
- **我做**：复述确认 + 列 5–8 个关键不确定项，等你回复。
- **产出**：`docs/seed.md`（一句话目标 + 约束清单）

### Step 2 — 需求澄清（人机问答）
- **我做**：用 AskUserQuestion 工具一次问 3–4 个，收敛到用户故事 + AC。
- **你做**：回答问题，必要时补充反例。
- **产出**：`docs/requirements.md`（US-001…US-NNN，每个含验收标准）

### Step 3 — 架构设计（我做，G2 审阅）
- **我做**：技术栈选型、模块切分、Phase 切分（建议 5–8 个）、关键 ADR 草稿。
- **你做**：审阅；不通过就回到 Step 2 或本步迭代。
- **产出**：
  - `docs/architecture.md`
  - `docs/decisions/ADR-001-xxx.md` 等
  - `docs/phases.md`（Phase 列表 + 每个 Phase 的目标 + 退出条件）

### Step 4 — 准备 Phase 0：可启动脚手架
- **我做**：建项目结构 / 安装依赖 / 写最小 hello-world / 跑通 boot。
- **退出条件**：服务能 `start` + 健康检查 200。
- **不允许**：在 Phase 0 里塞业务功能。

### Step 5 — Phase 详细设计（我做，G3 审阅）⭐
- **我做**：当前 Phase 涉及的对象/触发器/接口/页面 详细到字段级。
- **你做**：审阅；通过后我在文档头写 `design_locked: true`。
- **产出**：`docs/phases/phase-N-design.md`

> **R1 停哨**：design.md 没有 `design_locked: true`，禁止进 Step 6。

### Step 6 — 编码（我做，自动）
- **我做**：按 design.md 写代码；遇到没覆盖的设计点立即停下回 G5。
- **不允许**：边写边改设计；不允许「我觉得这样更好」绕过设计。

### Step 7 — 测试（我做，自动）
- **我做**：跑 validate / 单测 / 集成测试，**贴出真实输出**（不是「通过」二字）。
- **R3 停哨**：禁止伪造 PASS。失败必须如实回报，不许静默重试。

### Step 8 — 浏览器验证（人工，G4）⭐
- **我做**：给一份 checklist：「点哪个菜单 → 看到什么 → 做什么动作 → 期望结果」。
- **你做**：照做，PASS / FAIL。
- **FAIL 处置**：回 Step 6（小问题）或 Step 5（设计漏）。

### Step 9 — Phase 收尾归档（我做 + 你拍板 commit）
- **我做**：
  1. 写 `docs/changelog.md` 条目；如有不可逆决策追加 ADR
  2. **主动问你一句**：「Phase N 三件套已过，准备 commit。建议 message：`<Phase>: <模块> - <动作>`，要不要改？要不要现在提交？」
  3. 你说「commit」/「提交」/「yes」我才 `git add` + `git commit`；你说「等等」或给新 message 我就照办
- **退出条件**：validate 0/0 + 服务 boot + Step 8 PASS（DoD 三件套）+ 已 commit
- **为什么要问**：Claude Code 系统级规则禁止未经许可 commit，写在 Playbook 也覆盖不了；所以把「请求许可」做成 Phase 收尾的强制动作，避免漏 commit。

### Step 10 — 回到 Step 5 进入下个 Phase；或全部完成走 G6

---

## 四、4 条停哨（R1–R4）

| 编号 | 触发条件 | 行为 |
|------|---------|------|
| R1 | design.md 未 locked 就要写代码 | 立即停，等签字 |
| R2 | 不可逆决策 / 设计未覆盖 / 同一处连失败 2 次 / 一次性删改 > 200 行 | 立即停，向你结构化报告 |
| R3 | 测试输出造假或回避 | 禁止；必须贴原始输出 |
| R4 | Step 8 是每个 Phase 唯一不可省的人工点 | 不能跳过 |

---

## 五、3 条反偷懒口令（你随时可用）

- **「停先问我」** — 我立刻停手，把当前要做的事拆成问题清单。
- **「证明给我看」** — 我必须贴出真实命令输出 / 截图 / 日志，不许只说「已完成」。
- **「先文档再代码」** — 我必须先把 design.md 改了再写代码。

---

## 六、文档骨架

```
docs/
├── seed.md
├── requirements.md
├── architecture.md
├── phases.md
├── data-model.md
├── changelog.md
├── decisions/
│   ├── ADR-001-*.md
│   └── ...
└── phases/
    ├── phase-0-design.md
    ├── phase-1-design.md
    └── ...
```

---

## 七、进度可见性约定

**我汇报进展的地方（按实时性从高到低）：**

| 层级 | 位置 | 写入时机 | 你看什么 |
|------|------|---------|---------|
| 实时 | 终端工具调用条 (`Bash(...)` / `Write(...)`) | 每次操作 | 当前在干什么 |
| 实时 | TodoWrite 任务清单 | 每个 Phase 开始时建，每完成一项即更新 | 当前 step 进度条 |
| 实时 | 我每条回复的首/末行 | 每次发言 | 「下一步做 X」/「卡在 Y」 |
| 半实时 | `git log --oneline` | 每完成一个模块 commit 一次 | 最细颗粒进度 |
| 半实时 | `docs/phases/phase-N-design.md` | Step 5 完成时 | 是否 `design_locked: true` |
| 阶段性 | `docs/changelog.md` | 每个 Phase 收尾 | 交付清单 + 已知问题 |
| 阶段性 | `docs/decisions/ADR-*.md` | 触发不可逆决策时 | 技术选择与理由 |
| 异步 | `logs/` / 后台任务 `TaskOutput` | 长跑命令运行中 | 构建/启动详细输出 |

**约定**：
- 每个 Phase 开始我**必须**建 TodoWrite，列出本 Phase 所有 step。
- 你随时可以问「现在在哪一步」，我用一句话回答 + 指到对应 todo / changelog 行号。
- 任何超过 5 分钟的操作要么 run_in_background 要么先汇报「这步预计 N 分钟」。

---

## 八、与 project-pm 复盘的对应

| 这次踩的坑 | Playbook A 里的防护 |
|-----------|------------------|
| validate 通过却启动不了 | DoD 三件套（Step 9） |
| Phase 0 被跳过 | Step 4 显式存在，且其他 Phase 退出条件包含「服务可 boot」 |
| 设计含糊就开写 | R1 + G3 |
| 失败静默 | R3 |
| 端到端从不在浏览器跑 | G4（强制） |
