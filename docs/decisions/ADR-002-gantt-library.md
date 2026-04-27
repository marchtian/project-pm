# ADR-002: 选择 gantt-task-react 作为甘特图库

- **状态**：已采纳
- **日期**：2026-04-27
- **决策者**：项目负责人 + Claude

## 背景

PM 系统需要在项目详情页提供甘特图视图，支持任务时间轴、里程碑、进度展示，以及（项目经理角色）拖拽调整日期。Amis 本身没有原生甘特图组件，需通过 webapp 自定义实现。

## 候选方案

| 库 | 授权 | 优势 | 劣势 |
|---|---|---|---|
| **gantt-task-react** | MIT | 纯 React 组件；支持任务/里程碑/依赖/进度；轻量（~100KB） | 功能相对基础（够用） |
| dhtmlx-gantt（社区版） | GPL | 功能强大、UI 精美 | GPL 强传染性，商业项目需购买商业授权 |
| frappe-gantt | MIT | 轻量；UI 简洁 | 非 React 原生，集成需手写桥接 |
| bryntum-gantt | 商业 | 功能最完整 | 收费高 |
| 自研 SVG 甘特图 | — | 完全可控 | 投入大；维护成本高 |

## 决策

采用 **`gantt-task-react`**。

## 理由

1. **MIT 开源**：无任何商业授权风险
2. **React 原生**：直接渲染为 React 组件，与 webapp 技术栈一致，无需 wrapper
3. **核心功能齐备**：任务条、里程碑、依赖关系、进度、分组、视图切换（Day/Week/Month）
4. **拖拽回调清晰**：`onDateChange` / `onProgressChange` API 简洁，便于回写 Steedos
5. **Bundle 体积小**：约 100KB，适合 IIFE 打包
6. **后续可演进**：若需要更复杂功能（资源视图、关键路径），可平滑替换为 dhtmlx-gantt 商业版或自研

## 影响

- `webapps/gantt/package.json` 引入 `gantt-task-react` 依赖
- IIFE 构建时该库需打包进 bundle（不在 host 页面外部化）
- amis 组件 `pm-gantt` 的 props 设计与 `gantt-task-react` 的 `Task` 类型对齐

## 取舍

放弃了 dhtmlx-gantt 的更精美 UI 和高级特性（资源视图、关键路径、PDF 导出等），换取了：
- 零授权成本
- 与 React 生态无缝集成
- 长期可控的依赖

未来如需高级特性，可在不改变 amis 组件接口（`pm-gantt`）的前提下，替换底层实现。
