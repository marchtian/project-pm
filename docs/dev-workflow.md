# AI 协作开发流程（Dev Workflow）

> 本项目以 Claude（Opus 4.7）为主要开发者。本文档定义每个功能模块从需求到验收的标准流程。

## 五阶段流程

```
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│ 1. 需求 │ → │ 2. 设计 │ → │ 3. 编码 │ → │ 4. 测试 │ → │ 5. 验收 │
└─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘
     ↓             ↓             ↓             ↓             ↓
 用户故事      数据模型      元数据/代码      单测+E2E      端到端验证
 验收标准      接口/页面     提交           覆盖率         + changelog
              ADR
```

每完成一个模块，全部五阶段输出物归档到 `docs/`。

---

## 阶段 1：需求（Requirements）

### 输入
- 用户口头需求 / 业务目标

### 任务
- Claude 拆解为 **用户故事**（User Story）：「作为 X，我希望 Y，以便 Z」
- 列出 **验收标准（Acceptance Criteria, AC）**：可验证的具体条件
- 标记 **优先级**（P0/P1/P2）

### 输出
- 追加到 [`docs/requirements.md`](requirements.md)
- 模板：

```markdown
### US-XXX: <标题>
- **角色**：项目经理
- **故事**：作为项目经理，我希望……，以便……
- **优先级**：P0
- **验收标准**：
  - [ ] AC1：……
  - [ ] AC2：……
- **关联模块**：pm_project, pm_task
```

---

## 阶段 2：设计（Design）

### 输入
- 用户故事 + AC

### 任务
- 设计/更新 **数据模型**（对象、字段、关系）→ `docs/data-model.md`
- 设计 **接口**（触发器/函数签名、API endpoints）
- 设计 **页面/组件**（amis schema 草图、Webapp 交互流）
- 涉及不可逆技术选择时 → 新增 **ADR**

### 输出
- 更新 `docs/data-model.md` / `docs/architecture.md` / `docs/<module>-design.md`
- 新增 `docs/decisions/ADR-XXX-<topic>.md`（如有）

### Review checkpoint
向用户确认设计后再进入编码。

---

## 阶段 3：编码（Implementation）

### 输入
- 设计文档

### 任务
- **元数据层**：`.object.yml` / `.field.yml` / `.listview.yml` / `.permission.yml`
- **业务逻辑层**：`.trigger.yml` + JS handler / `.function.yml`
- **页面层**：`.page.yml` + `.page.amis.json`
- **Webapp 层**：React 组件 + Vite 配置
- **应用/导航层**：`.app.yml` / `.tab.yml`

### 编码约定
- 命名 `snake_case`（API name），双语标签（label / label_zh）
- 引用对应 Skill：`steedos-package-format`、`steedos-object-micro-pages`、`steedos-webapps`
- 每次提交都通过 `npx @steedos/validate steedos-packages/pm`

### 输出
- `steedos-packages/pm/` 下的实际代码

---

## 阶段 4：测试（Testing）

### 测试矩阵

| 层 | 类型 | 工具 | 位置 |
|---|---|---|---|
| 元数据 | 包结构校验 | `@steedos/validate` | CI |
| 触发器/函数 | 单元测试 | Jest / Mocha | `tests/unit/` |
| API | 集成测试 | supertest + Steedos | `tests/integration/` |
| Webapp 组件 | 组件单测 | Vitest + React Testing Library | `webapps/gantt/src/__tests__/` |
| 端到端 | E2E | Playwright（可选） | `tests/e2e/` |

### 任务
- 编写测试用例覆盖每条 AC
- happy path + 异常路径（权限拒绝、数据校验失败、并发等）
- 维护 [`docs/test-plan.md`](test-plan.md)

### 输出
- `tests/` 目录下的可执行测试
- `docs/test-plan.md` 更新覆盖率

---

## 阶段 5：验收（Acceptance）

### 任务
- 启动本地 Steedos 服务，按 AC 逐条端到端验证
- 关键页面/操作截图保存（可选）
- 在 [`docs/changelog.md`](changelog.md) 记录里程碑

### 验收 checklist 模板

```markdown
## <里程碑名> — YYYY-MM-DD
- 关联用户故事：US-001, US-002
- 验收结果：
  - [x] AC1：通过
  - [x] AC2：通过
  - [ ] AC3：阻塞，记入下一迭代
- 已知问题：……
- 下一步：……
```

---

## 跨阶段约定

### 文档与代码同步
- **任何代码变更都要伴随文档更新**：先改 `docs/`，再改代码（设计先行）
- 每个 PR/commit 在描述里引用 `docs/` 中对应小节

### 决策追溯（ADR）
- 不可逆 / 影响多个模块的技术选择 → 写 ADR
- 例如：选库、选架构模式、改数据模型基础结构

### 跨会话延续
- 新会话进入时，Claude 先读 `CLAUDE.md` → 进入对应 `docs/` 文档定位当前进度
- 通过 `docs/changelog.md` 知道已完成的里程碑
- 通过 `docs/requirements.md` 知道未完成的用户故事

---

## 流程示例：以「pm_task 子任务」功能为例

| 阶段 | 输出 |
|------|------|
| 1. 需求 | US-015：作为项目经理，希望任务可以拆分为子任务，以便细化跟踪。AC: 任务详情页可新增子任务；子任务完成度自动汇总到父任务 |
| 2. 设计 | `pm_task` 增加 `parent_task` lookup 字段；汇总通过 formula 字段。更新 `data-model.md` |
| 3. 编码 | `objects/pm_task/fields/parent_task.field.yml` + `actual_hours.field.yml`（formula） |
| 4. 测试 | 单测：建立父子关系；汇总计算正确；删除父任务时子任务处理 |
| 5. 验收 | 本地新建项目→新建任务→新建子任务→验证汇总；记入 `changelog.md` |
