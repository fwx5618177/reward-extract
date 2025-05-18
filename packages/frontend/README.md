# 抽奖系统前端

这是一个使用 Vite, TypeScript 和 PixiJS 构建的抽奖系统前端应用。

## 功能

- 手机号输入验证 (适配电脑和移动端)
- 抽奖转盘动画效果
- 奖品展示
- 与后端接口集成

## 开发环境设置

### 前提条件

- Node.js v16+
- pnpm

### 安装依赖

```bash
cd packages/frontend
pnpm install
```

### 运行开发服务器

```bash
pnpm dev
```

这将在 http://localhost:5173 启动开发服务器。

## 构建生产版本

```bash
pnpm build
```

构建后的文件将存放在 `dist` 目录中。

## 预览生产构建

```bash
pnpm preview
```

## 连接后端

前端默认连接到 `http://localhost:3001/api` 作为后端 API 地址。如果需要修改这个地址，请在 `src/main.ts` 文件中更新 `API_URL` 常量。

## 主要技术栈

- Vite - 构建工具
- TypeScript - 类型安全的 JavaScript
- PixiJS - 用于创建抽奖转盘的 2D WebGL 渲染器
- Axios - 用于 API 请求的 HTTP 客户端 