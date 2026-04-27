# Project Management System (PM) — Claude Code 项目指南

> 本文件由 Claude Code 自动加载，作为本项目的 AI 协作上下文。

## 项目简介

基于 **Steedos（华炎魔方）低代码平台** 构建的企业级 **项目管理系统（Project Management）**。
开发主要由 **Claude（Opus 4.7）** 协助完成 — 需求、设计、编码、测试、验收，全流程文档齐备以保证跨会话连续性。

## 关键事实

- **技术栈**：Steedos（Node.js + Moleculer + MongoDB） + Amis（前端） + React/Vite Webapp（甘特图）
- **包名**：`steedos-packages/pm/`
- **核心对象**：`pm_project`、`pm_milestone`、`pm_task`、`pm_member`、`pm_timesheet`、`pm_expense`、`pm_document`
- **甘特图**：通过 React Webapp（IIFE）注册为 amis 自定义组件 `pm-gantt`，采用 `gantt-task-react` 库（MIT）
- **AI 能力**：当前阶段不实现，留待后续扩充

## 文档地图

| 文档 | 内容 |
|------|------|
| [docs/architecture.md](docs/architecture.md) | 系统架构、目录结构、模块组成 |
| [docs/data-model.md](docs/data-model.md) | 7 个核心对象的字段定义与关系 |
| [docs/gantt-design.md](docs/gantt-design.md) | 甘特图 Webapp 技术方案 |
| [docs/requirements.md](docs/requirements.md) | 需求清单（用户故事 + 验收标准） |
| [docs/test-plan.md](docs/test-plan.md) | 测试策略、用例、覆盖率目标 |
| [docs/dev-workflow.md](docs/dev-workflow.md) | AI 协作开发全流程（需求→设计→编码→测试→验收） |
| [docs/decisions/ADR-001-tech-stack.md](docs/decisions/ADR-001-tech-stack.md) | 选择 Steedos 平台的决策 |
| [docs/decisions/ADR-002-gantt-library.md](docs/decisions/ADR-002-gantt-library.md) | 选择 gantt-task-react 的决策 |
| [docs/planning-discussion.md](docs/planning-discussion.md) | 原始规划讨论纪要 |
| [docs/changelog.md](docs/changelog.md) | 变更日志（每个里程碑/迭代） |

## AI 协作开发全流程

每个功能模块（对象、触发器、页面、Webapp 等）按以下流程推进，详见 [dev-workflow.md](docs/dev-workflow.md)：

```
需求 → 设计 → 编码 → 测试 → 验收 → 文档归档
 ↓      ↓      ↓      ↓      ↓        ↓
用户  数据/  YAML/  自动化 端到端  更新 docs/
故事  接口/  JS/TS  脚本+  人工    + changelog
+AC   交互   实现   单测   场景    + ADR（如有决策）
```

### 各阶段输出物

| 阶段 | 输出 | 存放位置 |
|------|------|----------|
| **需求** | 用户故事、验收标准（AC） | `docs/requirements.md` |
| **设计** | 数据模型、接口、页面草图、ADR | `docs/data-model.md`、`docs/*-design.md`、`docs/decisions/` |
| **编码** | 元数据 YAML / Service JS / React 组件 | `steedos-packages/pm/` |
| **测试** | 单元测试、集成测试、E2E 测试用例 | `tests/`、`docs/test-plan.md` |
| **验收** | 端到端验证报告、截图 | `docs/changelog.md` |
| **归档** | 更新所有相关文档、ADR | `docs/` |

## 实施阶段（按里程碑）

每个阶段都包含上述完整开发流程：

1. **项目脚手架**：根目录 `package.json` / `steedos-config.yml` / `.env` / `.gitignore`
2. **核心对象**：7 个对象、字段、列表视图、权限
3. **业务逻辑**：触发器（编号生成、状态联动、工时校验）
4. **应用与权限**：`pm_app`、角色权限集
5. **甘特图 Webapp**：`webapps/gantt` → IIFE → amis 组件
6. **报表与仪表盘**：questions / dashboards
7. **验证**：`npx @steedos/validate` + 端到端测试

## 工作约定

### 编码约定
- **新建/修改对象、触发器、页面**：参考已加载的 `steedos-package-format`、`steedos-object-micro-pages`、`steedos-webapps` 技能
- **API 调用**：所有 `/api/v6/data/` 列表请求必须带 `skip` 和 `top` 参数
- **甘特图组件**：注册类型为 `pm-gantt`，CSS scope 为 `.pm-gantt`

### 文档约定
- **文档优先**：每完成一个模块，先更新 `docs/`，再 commit 代码
- **决策记录**：每个不可逆的技术选择，新增一份 ADR（`docs/decisions/ADR-XXX-*.md`）
- **变更追溯**：每个里程碑结束写入 `docs/changelog.md`

### 测试约定
- **每个对象**：至少覆盖 CRUD + 权限边界
- **每个触发器**：单元测试 happy path + 至少 1 个异常路径
- **甘特图 Webapp**：组件单测 + 端到端拖拽场景
- **校验**：包结构变更后运行 `npx @steedos/validate steedos-packages/pm`

### 提交约定
- Commit message 格式：`<阶段编号>: <模块> - <动作>`，例如 `2: pm_task - add fields and listview`
- 每个 PR 关联 `docs/changelog.md` 条目
