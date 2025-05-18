import { Request, Response } from 'express';
import { prizeStore } from '../models/prizeModel';
import { userStore } from '../models/userModel';

// 获取所有奖品
export const getPrizes = (req: Request, res: Response) => {
  const prizes = prizeStore.getAllPrizes();
  const probabilities = prizeStore.getConfig().probabilities;
  // 为每个奖品附加概率字段
  const prizesWithProb = prizes.map(prize => ({
    ...prize,
    probability: probabilities[prize.level] || 0
  }));
  return res.status(200).json({
    success: true,
    data: prizesWithProb
  });
};

// 抽奖
export const drawPrize = (req: Request, res: Response) => {
  const { phoneNumber } = req.body;
  
  if (!phoneNumber) {
    return res.status(400).json({ 
      success: false, 
      message: '手机号不能为空' 
    });
  }
  
  // 验证用户是否存在
  const user = userStore.getUserByPhone(phoneNumber);
  if (!user) {
    return res.status(404).json({ 
      success: false, 
      message: '用户不存在，请确认您是已注册的顾客' 
    });
  }
  
  // 检查用户今天是否已经参与抽奖
  if (userStore.hasParticipatedToday(phoneNumber)) {
    return res.status(400).json({
      success: false,
      message: '您今天已经参与过抽奖，请明天再来！'
    });
  }
  
  // 进行抽奖
  const prize = prizeStore.drawPrize();
  
  if (!prize) {
    return res.status(500).json({
      success: false,
      message: '抽奖失败，所有奖品已经发完'
    });
  }
  
  // 记录用户参与状态和中奖信息
  userStore.markAsParticipated(phoneNumber, prize.id);
  
  return res.status(200).json({
    success: true,
    data: prize
  });
};
