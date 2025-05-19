#!/bin/sh
# 启动后端
cd /app/backend
PORT=${PORT:-3001}
node dist/index.js &

# 启动nginx
nginx -g "daemon off;"