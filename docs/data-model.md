# 数据模型

7 个核心业务对象，全部位于 `steedos-packages/pm/main/default/objects/`。

## 关系总览

```
pm_project (项目)
   ├── pm_milestone (里程碑) — master_detail
   ├── pm_task (任务) — lookup
   │     ├── pm_task (子任务) — self lookup
   │     ├── pm_milestone — lookup
   │     └── pm_timesheet — lookup
   ├── pm_member (成员) — master_detail
   ├── pm_timesheet (工时) — lookup
   ├── pm_expense (费用) — master_detail
   └── pm_document (文档) — master_detail
```

## 1. pm_project（项目）

| 字段 | 类型 | 说明 |
|------|------|------|
| name | text | 项目名称（必填） |
| code | text | 项目编号（自动生成 PM-YYYY-NNN） |
| status | select | 规划中 / 进行中 / 已完成 / 已关闭 |
| start_date | date | 开始日期 |
| end_date | date | 截止日期 |
| owner | lookup(users) | 项目经理 |
| description | textarea | 项目描述 |
| budget | currency | 预算金额 |
| actual_cost | formula | 实际成本（汇总 pm_expense.amount） |

## 2. pm_milestone（里程碑）

| 字段 | 类型 | 说明 |
|------|------|------|
| name | text | 里程碑名称 |
| project | master_detail(pm_project) | 所属项目 |
| due_date | date | 截止日期 |
| status | select | 未开始 / 进行中 / 已完成 |
| description | textarea | 描述 |

## 3. pm_task（任务）

| 字段 | 类型 | 说明 |
|------|------|------|
| name | text | 任务名称 |
| project | lookup(pm_project) | 所属项目 |
| milestone | lookup(pm_milestone) | 所属里程碑 |
| parent_task | lookup(pm_task) | 父任务（子任务支持） |
| assignee | lookup(users) | 负责人 |
| status | select | 待办 / 进行中 / 已完成 / 已取消 |
| priority | select | 低 / 中 / 高 / 紧急 |
| start_date | date | 开始日期 |
| due_date | date | 截止日期 |
| estimated_hours | number | 预计工时 |
| actual_hours | formula | 实际工时（汇总 pm_timesheet.hours） |
| description | textarea | 描述 |

## 4. pm_member（项目成员）

| 字段 | 类型 | 说明 |
|------|------|------|
| project | master_detail(pm_project) | 所属项目 |
| user | lookup(users) | 成员 |
| role | select | 项目经理 / 开发 / 测试 / 设计 / 观察者 |
| join_date | date | 加入日期 |

## 5. pm_timesheet（工时记录）

| 字段 | 类型 | 说明 |
|------|------|------|
| task | lookup(pm_task) | 关联任务 |
| project | lookup(pm_project) | 关联项目 |
| user | lookup(users) | 记录人 |
| work_date | date | 工作日期 |
| hours | number | 工时（小时） |
| description | textarea | 工作内容 |

## 6. pm_expense（费用记录）

| 字段 | 类型 | 说明 |
|------|------|------|
| project | master_detail(pm_project) | 所属项目 |
| category | select | 人力 / 差旅 / 采购 / 其他 |
| amount | currency | 金额 |
| expense_date | date | 日期 |
| description | textarea | 说明 |
| submitter | lookup(users) | 提交人 |

## 7. pm_document（项目文档）

| 字段 | 类型 | 说明 |
|------|------|------|
| project | master_detail(pm_project) | 所属项目 |
| name | text | 文档名称 |
| category | select | 需求 / 设计 / 测试 / 交付 / 其他 |
| file | file | 附件 |
| version | text | 版本号 |
| description | textarea | 说明 |

## 触发器

### pm_project.trigger.yml
- `beforeInsert`：自动生成项目编号 `PM-YYYY-NNN`（按年累加）
- `afterUpdate`：项目状态 → 已关闭时，关联未完成任务标记为已取消

### pm_task.trigger.yml
- `beforeInsert/beforeUpdate`：校验 `due_date >= start_date`
- `afterUpdate`：里程碑下任务全部完成时，自动推进里程碑状态为「已完成」

### pm_timesheet.trigger.yml
- `beforeInsert`：校验同一用户当日工时合计 ≤ 24 小时

## 权限矩阵

| 角色 | 项目 | 任务 | 工时 | 费用 | 文档 |
|------|------|------|------|------|------|
| 管理员 | 全部 CRUD | 全部 CRUD | 全部 CRUD | 全部 CRUD | 全部 CRUD |
| 项目经理 | 创建/编辑自己的 | 全部 CRUD | 查看 | 创建/编辑 | 全部 |
| 成员 | 只读 | 编辑分配的 | 创建自己的 | 只读 | 只读 |
| 观察者 | 只读 | 只读 | 无 | 无 | 只读 |
