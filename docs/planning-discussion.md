# 规划讨论纪要

> 本文档记录 PM 系统从零规划阶段的关键讨论与决策。
> 时间：2026-04-27
> 参与：项目负责人 + Claude (Opus 4.7)

## 讨论脉络

### 1. 起点

负责人提出：基于 Steedos 开发一套软件系统，以 AI（Claude）为主完成计划、设计、编码、测试，文档要齐备。

### 2. 项目类型确认

- 选定领域：**项目管理（PM）**
- 类型：全新项目（greenfield）
- 模块范围：项目计划与任务、资源与预算、报表与仪表盘、文档管理
- AI 能力：**当前阶段不实现**，留待后续扩充

### 3. 关键功能补充

- 明确需要 **甘特图** 功能 → 触发后续技术选型讨论

### 4. 文档策略

负责人提出疑问：既然开发由 Claude 协助，方案讨论是否要以文档形式保存在项目中？

**结论：完整保存（推荐方案）**

文档结构：
- `CLAUDE.md` — Claude Code 自动加载的项目指南
- `docs/architecture.md` — 架构总览
- `docs/data-model.md` — 数据模型
- `docs/gantt-design.md` — 甘特图技术方案
- `docs/decisions/ADR-*.md` — 决策记录
- `docs/planning-discussion.md` — 本文档

**好处**：
- 跨会话上下文延续（Claude 重新进入项目时可快速恢复）
- 决策可追溯（ADR 记录"为什么选 X 而不是 Y"）
- 团队成员（人或 AI）可通过文档快速 onboarding

### 5. 技术选型

| 议题 | 决策 | ADR |
|---|---|---|
| 平台 | Steedos 低代码 | [ADR-001](decisions/ADR-001-tech-stack.md) |
| 甘特图库 | gantt-task-react（MIT） | [ADR-002](decisions/ADR-002-gantt-library.md) |
| 甘特图集成 | React Webapp（IIFE）→ amis 自定义组件 `pm-gantt` | — |

### 6. 数据模型设计

确定 7 个核心对象：
- `pm_project`（项目）
- `pm_milestone`（里程碑）
- `pm_task`（任务，支持子任务）
- `pm_member`（项目成员）
- `pm_timesheet`（工时记录）
- `pm_expense`（费用记录）
- `pm_document`（项目文档）

详见 [data-model.md](data-model.md)。

### 7. 实施阶段划分

7 个阶段，从脚手架 → 对象 → 触发器 → 应用权限 → 甘特图 → 报表 → 验证。详见 [CLAUDE.md](../CLAUDE.md)「实施阶段」一节。

## 后续工作

按 7 个阶段顺序实施。每完成一个模块：
1. 更新对应的 docs/ 文件
2. 运行 `npx @steedos/validate steedos-packages/pm` 校验
3. 提交 git，commit message 引用对应阶段编号

## 备注

完整规划方案存档于 `/Users/tianqi/.claude/plans/steedos-silly-russell.md`（plan mode 输出）。
