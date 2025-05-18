import { Router } from 'express';
import { getPrizes, drawPrize } from '../controllers/prizeController';

const router = Router();

// 获取所有奖品信息
router.get('/', getPrizes);

// 抽奖
router.post('/draw', drawPrize);

export default router;
