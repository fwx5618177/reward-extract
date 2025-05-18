# 抽奖系统

一个基于 pnpm workspace 的 monorepo 结构的抽奖系统，包含前端和后端。

## 项目结构

```
- packages/
  - frontend/ - 基于 Vite + TypeScript + PixiJS 的前端应用
  - backend/  - 基于 Express + TypeScript 的后端应用
```

## 功能

- 顾客手机号验证
- 抽奖转盘
- 多等级奖品设置
- 每个用户每天只能抽奖一次
- Excel 用户数据导入

## 安装

1. 安装所有依赖

```bash
pnpm install
```

2. 启动后端

```bash
cd packages/backend
pnpm dev
```

3. 启动前端

```bash
cd packages/frontend
pnpm dev
```

## 配置

### 用户数据

后端会在启动时从 `packages/backend/data/users.xlsx` 加载用户数据。如果该文件不存在，可以通过管理员 API 上传 Excel 文件。

Excel 文件应包含以下列：
- 手机号
- 姓名 (可选)
- 其他用户信息 (可选)

### 奖品配置

奖品在后端应用中配置。管理员可以通过管理员 API 管理奖品。

## 开发者文档

请参考每个包内部的 README 文件获取详细的开发者文档：

- [前端文档](./packages/frontend/README.md)
- [后端文档](./packages/backend/README.md)
