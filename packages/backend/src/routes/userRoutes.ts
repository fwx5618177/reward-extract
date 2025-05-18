import { Router } from 'express';
import { verifyUser, getParticipationStatus, markAsParticipated } from '../controllers/userController';

const router = Router();

// 验证用户手机号是否存在
router.post('/verify', verifyUser);

// 检查用户是否已经参与抽奖
router.get('/:phoneNumber/status', getParticipationStatus);

// 标记用户已参与抽奖
router.post('/:phoneNumber/participate', markAsParticipated);

export default router;
