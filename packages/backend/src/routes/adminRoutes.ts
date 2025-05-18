import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { login, uploadUsers, getPrizeConfig, updatePrizeConfig } from '../controllers/adminController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../data/'));
  },
  filename: function (req, file, cb) {
    cb(null, 'users.xlsx');
  }
});

const upload = multer({ storage });

// 管理员登录 - 公开接口，不需要身份验证
router.post('/login', login);

// 以下接口需要身份验证
// 上传用户Excel文件
router.post('/upload-users', authMiddleware, upload.single('file'), uploadUsers);

// 获取奖品配置
router.get('/prizes/config', authMiddleware, getPrizeConfig);

// 更新奖品配置
router.put('/prizes/config', authMiddleware, updatePrizeConfig);

export default router;
