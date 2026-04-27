# 变更日志（Changelog）

> 每完成一个里程碑或重要功能，按倒序追加到本文件。
> 格式参考 [Keep a Changelog](https://keepachangelog.com/) + [`dev-workflow.md`](dev-workflow.md) 的验收 checklist。

---

## [Unreleased]

### 进行中
- Phase 3 / 4 / 5 / 5b 已完成
- 下一步：Phase 6 报表与仪表盘 + Phase 7 端到端验证

---

## Phase 3 + 4 + 5 + 5b 完成 — 2026-04-27

### 范围
- Phase 3：pm_task 触发器（日期校验 + 里程碑自动推进）
- Phase 4：pm_app 应用 + 7 个 tab + 3 个权限集（manager / member / observer）
- Phase 5：甘特图 React Webapp（IIFE → amis 自定义组件 `pm-gantt`）
- Phase 5b：pm_project 详情页（含甘特图 Tab）

### 验收结果
- [x] pm_task.trigger.js：beforeInsert/Update 校验 due_date ≥ start_date；afterUpdate 检测里程碑下任务全部完成→推进里程碑 status=completed
- [x] applications/pm_app.app.yml：code=pm_app, icon=work_order_item, 关联 7 个 tab
- [x] tabs/：pm_project_tab、pm_task_tab、pm_milestone_tab、pm_member_tab、pm_timesheet_tab、pm_expense_tab、pm_document_tab（type=object，desktop+mobile）
- [x] permissionsets/：pm_manager / pm_member / pm_observer，均 license=free，assigned_apps=[pm_app]
- [x] webapps/gantt/：Vite + React + gantt-task-react；IIFE 构建成功（amis-renderer.js 36.84 kB / .css 4.58 kB）
- [x] public/gantt/：构建产物已部署（amis-renderer.js + amis-renderer.css）
- [x] client/gantt.client.js：waitForThing(antd) → loadCss + loadJs
- [x] routes/gantt.router.js：express.static 暴露 /gantt
- [x] pages/pm_project_detail.page.yml + .page.amis.json：tabs（概览/甘特图/里程碑/任务/成员/工时/费用/文档），甘特图 Tab 通过 `{type:"pm-gantt", projectId:"${_id}"}` 嵌入
- [x] `npx @steedos/validate steedos-packages/pm` → **89 files, 0 errors, 0 warnings**

### 变更内容
- Added：`triggers/pm_task.trigger.js`
- Added：`applications/pm_app.app.yml`
- Added：`tabs/pm_*_tab.tab.yml` × 7
- Added：`permissionsets/pm_{manager,member,observer}.permissionset.yml`
- Added：`webapps/gantt/`（package.json / tsconfig / vite.config.ts / vite.amis.config.ts / src/{amis-entry.ts, amis-jsx-shim.ts, amis-renderer.css, components/GanttChart.tsx}）
- Added：`public/gantt/{amis-renderer.js, amis-renderer.css}`（构建产物）
- Added：`client/gantt.client.js`、`routes/gantt.router.js`
- Added：`pages/pm_project_detail.page.{yml,amis.json}`

### 已知问题
- 端到端 UI 测试未跑：需启动 Steedos 服务，登录后访问项目详情页验证甘特图 Tab 实际渲染
- 拖拽回写日期 PATCH 接口未做权限测试（observer 角色应被服务端拒绝）
- 里程碑自动推进只在所有任务都 status=completed 时触发；如里程碑下没有任务则不推进（按设计）

### 下一步
- Phase 6：questions/dashboards
- Phase 7：启动服务进行端到端冒烟

---

## Phase 2 全部核心对象完成 — 2026-04-27

### 范围
- pm_milestone、pm_task、pm_member、pm_timesheet、pm_expense、pm_document

### 验收结果
- [x] pm_milestone：name / project(M-D) / due_date / status / description；admin 全开 / user 读
- [x] pm_task：name / project / milestone / assignee / status / priority / start_date / due_date / estimated_hours / actual_hours / description / parent_task；2 listviews
- [x] pm_member：project(M-D) / user / role / join_date；user 字段标记 is_name
- [x] pm_timesheet：task / project / user / work_date / hours / description；2 listviews（all + my_timesheets）；trigger 校验单条 0~24h，并校验同人同日总和 ≤ 24h
- [x] pm_expense：project(M-D) / category / amount / expense_date / submitter / description；icon `orders`
- [x] pm_document：name / project(M-D) / category / file / version / description
- [x] `npx @steedos/validate steedos-packages/pm` → 79 files, 0 errors, 0 warnings

### 变更内容
- Added：6 个对象目录（object.yml + fields + listviews + permissions）
- Added：`triggers/pm_timesheet.trigger.js`（单条工时与日总和校验）
- Changed：调整 SLDS 图标（pm_expense → orders、pm_timesheet → event）
- Changed：name-like 字段添加 `is_name: true`（pm_member.user / pm_timesheet.task / pm_expense.category）

### 已知问题
- pm_project.actual_cost summary 字段已可对 pm_expense.amount 汇总，待端到端冒烟测试
- pm_project 状态闭合联动 pm_task 的触发器待端到端验证

### 下一步
- Phase 3：补充触发器（如 pm_task 日期校验、里程碑自动推进）
- Phase 4：创建 pm_app 应用、tabs、权限集

---

## pm_project 对象完成 — 2026-04-27

### 关联用户故事
- US-001（项目立项）、US-002（项目状态闭合联动任务）

### 验收结果
- [x] AC1：`pm_project` 对象含 9 字段（name / code / status / start_date / end_date / owner / description / budget / actual_cost）
- [x] AC2：`code` 字段通过 beforeInsert 触发器自动生成（PM-YYYY-NNN，年内递增）
- [x] AC3：admin 权限全开；user 权限读写但不能删除，code/actual_cost 只读
- [x] AC4：列表视图 all（全部项目）+ my_projects（我管理的项目）
- [x] AC5：项目状态变更为 closed 时，自动取消所有未完成任务（pm_task 对象后置完成时生效）
- [x] AC6：截止日期早于开始日期时拦截（beforeUpdate 校验）
- [x] AC7：`actual_cost` 通过 summary 字段汇总 pm_expense.amount（依赖 pm_expense，将随其创建生效）
- [x] AC8：`npx @steedos/validate steedos-packages/pm` → 0 errors, 0 warnings

### 变更内容
- Added：`steedos-packages/pm/main/default/objects/pm_project/`（object.yml + 9 字段 + 2 listview + 2 权限）
- Added：`steedos-packages/pm/main/default/triggers/pm_project.trigger.js`（code 生成 + 日期校验 + 状态联动）
- Changed：object icon 从 `project` 调整为 `work_order_item`（SLDS 有效图标）

### 已知问题
- `actual_cost` summary 字段引用 pm_expense，pm_expense 尚未创建——后续创建时该字段自动生效
- 状态闭合联动 pm_task 的逻辑已编写，需 pm_task 对象就位后端到端验证

### 下一步
- 创建 pm_milestone 对象（里程碑）

---

## 模板

```markdown
## <里程碑名称> — YYYY-MM-DD

### 关联用户故事
- US-001, US-002

### 验收结果
- [x] AC1：……
- [x] AC2：……
- [ ] AC3：阻塞，记入下一迭代

### 变更内容
- Added：新增 pm_project 对象与 7 个字段
- Changed：调整 …… 字段类型
- Fixed：修复 …… 触发器缺陷

### 已知问题
- ……

### 下一步
- ……
```

---

## 版本规划（占位）

| 版本 | 目标里程碑 | 用户故事 | 计划日期 |
|------|-----------|---------|---------|
| v0.1.0 | 项目脚手架 + 7 个核心对象 | US-001 ~ US-050 | TBD |
| v0.2.0 | 业务逻辑与权限 | US-002, US-020, US-030, US-060, US-061 | TBD |
| v0.3.0 | 甘特图 Webapp | US-070, US-071 | TBD |
| v0.4.0 | 报表与仪表盘 | US-080 | TBD |
| v1.0.0 | 全部 P0/P1 完成 + E2E 验收 | — | TBD |
