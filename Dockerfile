# --------- 构建前端 ---------
FROM node:20 AS frontend-build
WORKDIR /app
# 设置 npm 环境变量
ENV NPM_CONFIG_REGISTRY=https://registry.npmmirror.com \
    NPM_CONFIG_DISTURL=https://npmmirror.com/mirrors/node
COPY pnpm-lock.yaml .
COPY packages/frontend ./packages/frontend
COPY packages/frontend/package.json ./packages/frontend/
WORKDIR /app/packages/frontend
RUN npm install -g pnpm && \
    PNPM_HOME="/root/.local/share/pnpm" \
    PATH="$PNPM_HOME:$PATH" \
    PNPM_REGISTRY=https://registry.npmmirror.com \
    pnpm install && \
    pnpm build

# --------- 构建后端 ---------
FROM node:20 AS backend-build
WORKDIR /app
# 设置 npm 环境变量
ENV NPM_CONFIG_REGISTRY=https://registry.npmmirror.com \
    NPM_CONFIG_DISTURL=https://npmmirror.com/mirrors/node
COPY pnpm-lock.yaml .
COPY packages/backend ./packages/backend
COPY packages/backend/package.json ./packages/backend/
WORKDIR /app/packages/backend
RUN npm install -g pnpm && \
    PNPM_HOME="/root/.local/share/pnpm" \
    PATH="$PNPM_HOME:$PATH" \
    PNPM_REGISTRY=https://registry.npmmirror.com \
    pnpm install && \
    pnpm build

# --------- 生产镜像（nginx serve 前端，node serve 后端） ---------
FROM nginx:1.25-alpine

# 安装 nodejs 和 pnpm
# 设置 npm 环境变量
ENV NPM_CONFIG_REGISTRY=https://registry.npmmirror.com \
    NPM_CONFIG_DISTURL=https://npmmirror.com/mirrors/node \
    PNPM_REGISTRY=https://registry.npmmirror.com

# 设置 Alpine 镜像源并安装 nodejs
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories && \
    apk update && \
    apk add --no-cache nodejs npm && \
    npm install -g pnpm

WORKDIR /app

# 拷贝前端dist到nginx目录
COPY --from=frontend-build /app/packages/frontend/dist /usr/share/nginx/html

# 拷贝nginx配置
COPY nginx.conf /etc/nginx/nginx.conf

# 拷贝后端
COPY --from=backend-build /app/packages/backend /app/backend

# 后端依赖
WORKDIR /app/backend
RUN PNPM_REGISTRY=https://registry.npmmirror.com pnpm install --prod

# 启动脚本
WORKDIR /app
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 80 3001

CMD ["/app/docker-entrypoint.sh"]