# 测试计划（Test Plan）

> 本文件维护 PM 项目的测试策略、覆盖矩阵与每个用户故事的测试用例进度。
> 配合 [`dev-workflow.md`](dev-workflow.md) 阶段 4 使用。

## 1. 测试策略

| 层 | 类型 | 工具 | 位置 | 覆盖目标 |
|----|------|------|------|---------|
| 元数据 | 包结构校验 | `@steedos/validate` | CI | 100% |
| 触发器 / 函数 | 单元测试 | Jest | `tests/unit/` | ≥ 80% |
| API | 集成测试 | supertest + Steedos | `tests/integration/` | 关键 endpoint 100% |
| Webapp 组件 | 组件测试 | Vitest + React Testing Library | `webapps/gantt/src/__tests__/` | 关键组件 ≥ 70% |
| 端到端 | E2E（可选） | Playwright | `tests/e2e/` | P0 故事必覆盖 |

## 2. 用例矩阵

每个用户故事对应若干测试用例。命名约定：`TC-<US>-<序号>`。

### pm_project（US-001 ~ US-003）

| 用例 | 类型 | 描述 | 状态 |
|------|------|------|------|
| TC-001-1 | 单测 | beforeInsert 自动生成项目编号 PM-YYYY-NNN | ⏳ |
| TC-001-2 | 集成 | POST /api/v6/data/pm_project 创建后状态为「规划中」 | ⏳ |
| TC-001-3 | 集成 | 创建人自动写入 owner | ⏳ |
| TC-002-1 | 单测 | 状态变更为「已关闭」时联动取消未完成任务 | ⏳ |
| TC-002-2 | 集成 | 已关闭项目非管理员 PATCH 返回 403 | ⏳ |
| TC-003-1 | 单测 | actual_cost formula 汇总正确 | ⏳ |

### pm_milestone（US-010）

| 用例 | 类型 | 描述 | 状态 |
|------|------|------|------|
| TC-010-1 | 集成 | 必须关联 project（master_detail） | ⏳ |
| TC-010-2 | 单测 | 关联任务全完成时 milestone.status 自动 = 已完成 | ⏳ |

### pm_task（US-020 ~ US-022）

| 用例 | 类型 | 描述 | 状态 |
|------|------|------|------|
| TC-020-1 | 单测 | due_date 早于 start_date 时拒绝 | ⏳ |
| TC-020-2 | 集成 | 任务可关联 project + milestone | ⏳ |
| TC-021-1 | 集成 | parent_task 自引用支持子任务列表 | ⏳ |
| TC-022-1 | E2E | 列表页 group by status 显示看板 | ⏳ |

### pm_timesheet（US-030）

| 用例 | 类型 | 描述 | 状态 |
|------|------|------|------|
| TC-030-1 | 单测 | 同用户同日工时合计 > 24h 拒绝 | ⏳ |
| TC-030-2 | 单测 | 写入后 pm_task.actual_hours 汇总更新 | ⏳ |

### pm_expense（US-040）

| 用例 | 类型 | 描述 | 状态 |
|------|------|------|------|
| TC-040-1 | 单测 | 写入后 pm_project.actual_cost 汇总更新 | ⏳ |

### pm_document（US-050）

| 用例 | 类型 | 描述 | 状态 |
|------|------|------|------|
| TC-050-1 | 集成 | 上传附件并关联 project | ⏳ |

### 成员与权限（US-060 ~ US-061）

| 用例 | 类型 | 描述 | 状态 |
|------|------|------|------|
| TC-060-1 | 集成 | 加入成员时按角色获得对应权限集 | ⏳ |
| TC-061-1 | 集成 | 观察者写操作返回 403 | ⏳ |
| TC-061-2 | 集成 | 成员只能编辑自己负责的任务 | ⏳ |

### 甘特图（US-070 ~ US-071）

| 用例 | 类型 | 描述 | 状态 |
|------|------|------|------|
| TC-070-1 | 组件 | GanttChart 加载并渲染任务 / 里程碑 | ⏳ |
| TC-070-2 | 组件 | 日 / 周 / 月视图切换正确 | ⏳ |
| TC-070-3 | E2E | 项目详情页可看到甘特图 Tab | ⏳ |
| TC-071-1 | 组件 | 拖拽任务条触发 PATCH 调用 | ⏳ |
| TC-071-2 | 组件 | API 失败时 UI 回滚 | ⏳ |
| TC-071-3 | 组件 | 非项目经理角色拖拽被禁用 | ⏳ |

### 仪表盘（US-080）

| 用例 | 类型 | 描述 | 状态 |
|------|------|------|------|
| TC-080-1 | E2E | 仪表盘 4 个图表正常加载 | ⏳ |

## 3. 进度统计

| 状态 | 数量 |
|------|------|
| ⏳ 未开始 | 22 |
| 🚧 进行中 | 0 |
| ✅ 通过 | 0 |
| ❌ 失败 | 0 |

## 4. 测试运行

```bash
# 所有单测 + 集成
npm test

# 仅单测
npm run test:unit

# webapp 组件测试
cd steedos-packages/pm/webapps/gantt && npm test

# E2E
npm run test:e2e
```

## 5. CI 集成（计划）

PR 流水线：
1. `npx @steedos/validate steedos-packages/pm`
2. `npm run test:unit`
3. `npm run test:integration`
4. `cd webapps/gantt && npm run build:amis && npm test`

合并条件：全部通过 + 覆盖率不低于阈值。
