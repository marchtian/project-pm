# 系统架构

## 技术栈

| 层 | 技术 |
|----|------|
| 平台 | Steedos（华炎魔方）低代码平台 |
| 后端 | Node.js + TypeScript + Moleculer 微服务 |
| 数据库 | MongoDB（元数据 + 业务数据） |
| 消息/缓存 | Redis |
| 前端 | Amis（百度低代码 UI）+ 标准 Steedos 组件 |
| 自定义组件 | React 18 + Vite（IIFE 编译为 amis Renderer） |
| 甘特图 | gantt-task-react（MIT） |

## 项目目录

```
project-pm/
├── package.json
├── steedos-config.yml
├── .env
├── .gitignore
├── CLAUDE.md
├── docs/
│   ├── architecture.md
│   ├── data-model.md
│   ├── gantt-design.md
│   ├── planning-discussion.md
│   └── decisions/
│       ├── ADR-001-tech-stack.md
│       └── ADR-002-gantt-library.md
└── steedos-packages/
    └── pm/
        ├── package.json
        ├── package.service.js
        ├── webapps/
        │   └── gantt/                    # 甘特图 React Webapp
        │       ├── src/
        │       │   ├── components/GanttChart.tsx
        │       │   ├── amis-entry.ts
        │       │   ├── amis-jsx-shim.ts
        │       │   └── amis-renderer.css
        │       ├── vite.config.ts
        │       ├── vite.amis.config.ts
        │       └── package.json
        ├── public/
        │   └── gantt/                    # IIFE 编译输出
        └── main/default/
            ├── objects/                  # 7 个核心对象
            ├── triggers/                 # 业务逻辑触发器
            ├── functions/                # 服务端函数
            ├── applications/             # pm_app
            ├── tabs/                     # 导航
            ├── permissions/              # 权限集
            ├── dashboards/               # 仪表盘
            ├── questions/                # 报表查询
            ├── pages/                    # 自定义页面（项目详情）
            ├── client/gantt.client.js    # 加载 amis 组件
            └── routes/gantt.router.js    # SPA 独立访问
```

## 模块组成

### 业务对象层（7 个对象）
见 [data-model.md](data-model.md)：
- `pm_project` 项目
- `pm_milestone` 里程碑
- `pm_task` 任务（支持子任务）
- `pm_member` 项目成员
- `pm_timesheet` 工时记录
- `pm_expense` 费用
- `pm_document` 文档

### 业务逻辑层（触发器）
- 项目编号自动生成（PM-YYYY-NNN）
- 项目状态变更时联动任务状态
- 任务日期校验（截止 ≥ 开始）
- 任务全部完成时推进里程碑状态
- 工时不超过 24 小时/天

### 表现层
- **标准 Amis 页面**：列表、详情、表单（由 Steedos 自动生成）
- **自定义页面**：`pm_project_detail.page.amis.json` — 包含「概览/甘特图/任务/成员/文档」Tab
- **Webapp 组件**：`pm-gantt` 甘特图（见 [gantt-design.md](gantt-design.md)）

### 报表/仪表盘
- Questions：项目状态、任务进度、成员工时、预算 vs 实际
- Dashboard：`pm_overview.dashboard.yml`

## 数据流（以甘特图为例）

```
项目详情页 (amis tabs)
  → steedos-record-service 加载 pm_project
  → pm-gantt 组件 (type: "pm-gantt", projectId: "${_id}")
      → GET /api/v6/data/pm_task?filters=[["project","=","${_id}"]]&skip=0&top=200
      → GET /api/v6/data/pm_milestone?filters=[["project","=","${_id}"]]&skip=0&top=50
      → 转换为 gantt-task-react Task[] 格式
      → 渲染 <Gantt />
      → 拖拽事件 → PATCH /api/v6/data/pm_task/:id
```

## 部署模型

- 开发环境：本地 MongoDB + Redis + `npm start`
- 生产环境：标准 Steedos 部署（Docker 或 Node 直接运行）
- Webapp 构建产物：`steedos-packages/pm/public/gantt/` 由 Steedos 静态文件服务托管
