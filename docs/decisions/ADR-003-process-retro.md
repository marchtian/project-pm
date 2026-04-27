# ADR-003：开发流程复盘 — 为什么 Phase 1-6 看似完成却跑不起来

- 状态：Accepted
- 日期：2026-04-27
- 决策者：用户 + Claude

---

## 背景

Phase 1-6 全部在 `docs/changelog.md` 中标记为「已完成」，每个 Phase 的验收行都写着：

> `npx @steedos/validate steedos-packages/pm` → **N files, 0 errors, 0 warnings**

但当用户要求进入 Phase 7（端到端验证）、第一次尝试启动服务时，发现：

1. `npm start` 报错 `sh: steedos: command not found`
2. 项目根目录从未执行过 `npm install` / `yarn install`
3. `package.json` 缺 `@steedos/cli` 依赖
4. `start` 脚本是 `steedos start`（错的），可工作的命令是 `steedos run`
5. 没有 `docker-compose.yml`，MongoDB/Redis 启动方式未约定
6. 也就是说：**前 6 个 Phase 没有任何一行代码在真实运行时被验证过**

## 根本原因

### 1. 把「校验通过」误判为「Phase 完成」

`@steedos/validate` 只检查 YAML 元数据格式，不会：
- 启动服务
- 加载对象
- 跑触发器
- 渲染页面
- 验证 webapp 注册

但每个 Phase 的 checklist 里都把它当作通过门槛，导致 6 个 Phase 在「服务从未启动过」的前提下被宣告完成。

### 2. 没有把「服务能启动」作为 Phase 0 的前置条件

CLAUDE.md 列出的实施阶段直接从「项目脚手架」跳到「核心对象」，跳过了「能跑起来」这一步。脚手架阶段只创建了配置文件，没有验证文件能让 Steedos 真正起来。

### 3. 没有对照参考工程

用户身边就有一个能跑的同源项目 `~/steedos-project/`（同样基于 Steedos）。如果在 Phase 0 就对照它的 `package.json` / `docker-compose.yml` / `.env`，会立刻发现 `@steedos/cli` 依赖、`steedos run` 命令、docker-compose 三件事缺失。这次复盘前完全没有对照过。

### 4. AI 把没做完的功课推给用户做

启动方式不确定时，第一反应是抛出 A/B 选项让用户选，而不是先去 sibling 工程里读一遍真实可工作的命令。用户明确反馈：「都不选。你先确认下，应该怎么起服务？」

类似地，npm vs yarn vs docker compose 的选型也是用户追问后才补的对比，而不是主动给出 trade-off。

## 决策

### 1. 修订 Phase 完成标准

每个 Phase 必须同时满足：
- ✅ `@steedos/validate` 0 errors / 0 warnings（保留）
- ✅ **服务可以启动**（`yarn start` 起来后无报错日志）
- ✅ **本 Phase 涉及的对象/触发器/页面在浏览器里至少打开过一次**
- ✅ 写入 `changelog.md` 时明确区分「validate 通过」与「runtime 验证通过」

### 2. 新增 Phase 0：可启动脚手架

在写任何业务对象之前必须完成：
- `package.json`：含 `@steedos/cli` + `@steedos/server`，`start` = `steedos run`，`start:db` = `docker-compose up mongodb redis`
- `docker-compose.yml`：mongo + redis，volume 名带项目前缀避免冲突
- `.env`：MONGO_URL / TRANSPORTER / CACHER 配好且端口/库与同机其他项目隔离
- `steedos-config.yml`：`metadata: [./steedos-packages/pm]`
- `yarn install` 执行成功
- `yarn start:db && yarn start` 能起到「监听 5100 端口」

只有 Phase 0 通过了，Phase 1-N 才有意义。

### 3. 调研后再提选项

涉及命令/工具/路径选型时：
- 先 `Read` 参考工程的相同文件
- 先 `Bash` 看可用工具版本
- 调研完后给出**带证据的推荐**，可以列备选但要标注推荐项与原因
- 不在没有调研的情况下抛 A/B 让用户拍板

### 4. 启动方式定为：本地 yarn + docker compose 起依赖

经过对比 npm vs yarn vs 全 docker：
- **`yarn start:db`**（docker 跑 mongo+redis）+ **`yarn start`**（本地跑 Steedos）是 dev 标准模式
- 与同机其他 Steedos 项目通过 db 名（`project-pm` vs `steedos`）和 redis db 编号（1 vs 0）隔离
- volume 用 `pm_mongodb_data` / `pm_redis_data` 前缀，删 sibling 不影响本项目数据

## 后果

### 正面
- 后续 Phase 不会再出现「validate 通过 = 完成」的假象
- Phase 0 一旦建立，端到端验证可以在每个 Phase 末尾即时执行
- 同机多 Steedos 项目数据互不影响

### 负面
- changelog 中已标完成的 Phase 1-6 实际仍欠 runtime 验证，需要在 Phase 7 集中补做
- 每个 Phase 多一次「点开浏览器看一眼」的成本（但这本来就该有）

## 相关变更

- 新增 `docker-compose.yml`
- `package.json`：补 `@steedos/cli` 依赖、改 `start` 为 `steedos run`、加 `start:db`
- `docs/changelog.md`：Phase 7 完成时补「runtime 验证」一栏
