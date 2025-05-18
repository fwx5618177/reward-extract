import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';

import apiRoutes from './routes';
import { loadUsersFromExcel } from './utils/excelLoader';

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors({
  origin: '*', // 允许所有来源访问，生产环境中应该设置为特定域名
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('dev'));
app.use(express.json());

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误'
  });
});

// 路由
app.use('/api', apiRoutes);

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '请求的资源不存在'
  });
});

// 数据初始化
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 尝试加载用户数据
try {
  const defaultExcelPath = path.join(__dirname, '../data/users.xlsx');
  if (fs.existsSync(defaultExcelPath)) {
    loadUsersFromExcel(defaultExcelPath);
    console.log('已从默认路径加载用户数据');
  } else {
    console.log('默认用户数据不存在，请通过API上传Excel文件');
  }
} catch (error) {
  console.error('加载用户数据失败:', error);
}

// 启动服务器
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log(`🎉 用户抽奖页面:      http://localhost:5173`);
  console.log(`🔒 管理员后台页面:    http://localhost:5173/#admin`);
  console.log('---');
  console.log('【管理员登录示例】');
  console.log('  用户名: admin');
  console.log('  密码:   admin123');
  console.log('---');
  console.log('【用户数据 Excel 示例】');
  console.log('  会员电话,姓名');
  console.log('  13800138000,张三');
  console.log('  13900139000,李四');
  console.log('='.repeat(60));
});
