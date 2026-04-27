# 甘特图技术方案

## 选型

| 项 | 决策 |
|---|---|
| 库 | `gantt-task-react`（MIT 开源，无商业授权限制） |
| 集成方式 | React + Vite Webapp，编译为 IIFE，注册为 amis Renderer |
| amis 组件类型 | `pm-gantt` |
| CSS scope | `.pm-gantt` |
| 嵌入位置 | 项目详情页（`pm_project_detail.page.amis.json`）的「甘特图」Tab |

详细决策见 [decisions/ADR-002-gantt-library.md](decisions/ADR-002-gantt-library.md)。

## 功能特性

| 功能 | 说明 |
|---|---|
| 任务条 | 按 `start_date` / `due_date` 渲染横条 |
| 里程碑 | 菱形标记 |
| 进度条 | 根据任务状态计算完成百分比 |
| 分组 | 按里程碑分组任务 |
| 时间轴 | 日 / 周 / 月 三种视图切换 |
| 拖拽 | 项目经理可拖拽调整日期，回写 API；其他角色只读 |
| 跳转 | 点击任务条跳转到任务详情 `/app/pm/pm_task/${id}` |
| 响应式 | 宽度自适应容器 |

## 目录结构

```
steedos-packages/pm/webapps/gantt/
├── src/
│   ├── components/
│   │   └── GanttChart.tsx           # 主组件
│   ├── amis-entry.ts                # amis Renderer 注册入口
│   ├── amis-jsx-shim.ts             # JSX runtime bridge
│   └── amis-renderer.css            # 样式入口（含 Tailwind/scope）
├── vite.config.ts                   # 标准 Vite 开发配置
├── vite.amis.config.ts              # IIFE 构建配置
├── package.json
└── tailwind.config.js
```

构建产物：`steedos-packages/pm/public/gantt/amis-renderer.{js,css}`

## 数据流

```
项目详情页（amis）
  ↓ steedos-record-service 加载 pm_project（取得 ${_id}）
  ↓
pm-gantt 组件（type: "pm-gantt", projectId: "${_id}"）
  ↓ 并行请求
  ├─ GET /api/v6/data/pm_task?filters=[["project","=","${_id}"]]&skip=0&top=200
  └─ GET /api/v6/data/pm_milestone?filters=[["project","=","${_id}"]]&skip=0&top=50
  ↓ 转换为 gantt-task-react Task[] 格式
  ↓ 渲染 <Gantt viewMode={Day|Week|Month} />
  ↓ 拖拽事件
  └─ PATCH /api/v6/data/pm_task/:id { start_date, due_date }
```

## 关键文件实现要点

### `src/amis-entry.ts`
- 通过 `amisRequire('react')` / `amisRequire('amis')` 复用宿主页面 React + amis
- 注册 `amisLib.Renderer({ type: 'pm-gantt', autoVar: true })`
- 桥接组件读取 `$schema.projectId`（amis 表达式 `${_id}` 解析后传入）

### `src/components/GanttChart.tsx`
- Props: `{ projectId: string; readonly?: boolean }`
- 内部使用 `fetch` 调用 API v6（**必须带 skip/top**）
- 维护 `viewMode` state（Day/Week/Month），渲染顶部切换按钮
- 数据转换：`pm_task` → `Task` (gantt-task-react)、`pm_milestone` → `type: "milestone"`
- 拖拽回写 throttle/debounce，失败时回滚 UI

### `src/amis-jsx-shim.ts`
- 标准 shim，将 `react/jsx-runtime` 桥接到外部化的 `React.createElement`
- 直接复用 `steedos-webapps` 技能中的模板代码

### `vite.amis.config.ts`
- `external: ['react', 'react-dom']`（gantt-task-react 不在 host 上，需打包进 bundle）
- `formats: ['iife']`，`fileName: () => 'amis-renderer.js'`
- `postcss-prefix-selector` scope: `.pm-gantt`

### `main/default/client/gantt.client.js`
```javascript
waitForThing(window, 'antd').then(function () {
  loadJs('/gantt/amis-renderer.js');
  loadCss('/gantt/amis-renderer.css');
});
```

### `main/default/pages/pm_project_detail.page.amis.json`
```json
{
  "type": "tabs",
  "tabs": [
    { "title": "概览", "body": { "type": "steedos-record-detail", "objectApiName": "pm_project" } },
    { "title": "甘特图", "body": { "type": "pm-gantt", "projectId": "${_id}" } },
    { "title": "任务", "body": { "type": "steedos-object-listview", "objectApiName": "pm_task", "filters": [["project","=","${_id}"]], "listName": "all" } },
    { "title": "成员", "body": { "type": "steedos-object-listview", "objectApiName": "pm_member", "filters": [["project","=","${_id}"]], "listName": "all" } },
    { "title": "文档", "body": { "type": "steedos-object-listview", "objectApiName": "pm_document", "filters": [["project","=","${_id}"]], "listName": "all" } }
  ]
}
```

## 构建与部署

```bash
cd steedos-packages/pm/webapps/gantt
npm install
npm run build:amis   # 编译 IIFE 并复制到 ../../public/gantt/
```

## 后续扩展

- 任务依赖关系（前置/后置）— gantt-task-react 原生支持 `dependencies`
- 关键路径高亮
- 资源视图（按成员排列任务）
- 导出 PDF/PNG
