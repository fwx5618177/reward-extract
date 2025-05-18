# 抽奖系统后端

这是一个使用 Express 和 TypeScript 构建的抽奖系统后端服务。

## 功能

- 用户验证 API
- 抽奖逻辑处理
- Excel 文件处理
- 奖品配置管理
- 用户参与记录

## 开发环境设置

### 前提条件

- Node.js v16+
- pnpm

### 安装依赖

```bash
cd packages/backend
pnpm install
```

### 运行开发服务器

```bash
pnpm dev
```

这将启动一个监听 http://localhost:3001 的开发服务器。

## 构建生产版本

```bash
pnpm build
```

构建后的文件将存放在 `dist` 目录中。

## 启动生产服务器

```bash
pnpm start
```

## API 接口

### 用户 API

- `POST /api/users/verify` - 验证用户手机号是否在系统中
- `GET /api/users/:phoneNumber/status` - 检查用户当天是否已参与抽奖
- `POST /api/users/:phoneNumber/participate` - 标记用户已参与抽奖

### 抽奖 API

- `GET /api/prizes` - 获取所有奖品信息
- `POST /api/prizes/draw` - 进行抽奖

### 管理员 API

- `POST /api/admin/login` - 管理员登录
- `POST /api/admin/upload-users` - 上传用户 Excel 文件
- `GET /api/admin/prizes/config` - 获取奖品配置
- `PUT /api/admin/prizes/config` - 更新奖品配置

## 数据存储

用户数据和抽奖结果存储在内存中，服务器重启后会丢失。在生产环境应考虑使用数据库存储。

### Excel 文件格式

用户 Excel 文件至少应包含以下列：

- 手机号码

### 默认管理员账户

默认管理员登录信息:
- 用户名: `admin`
- 密码: `admin123`

## 主要技术栈

- Express - Web 服务器框架
- TypeScript - 类型安全的 JavaScript
- Multer - 文件上传处理
- XLSX - Excel 文件处理 