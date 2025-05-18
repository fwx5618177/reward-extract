import { Request, Response } from 'express';
import { userStore } from '../models/userModel';

// 验证用户手机号是否存在
export const verifyUser = (req: Request, res: Response) => {
  const { phoneNumber } = req.body;
  
  if (!phoneNumber) {
    return res.status(400).json({ 
      success: false, 
      message: '手机号不能为空' 
    });
  }
  
  const user = userStore.getUserByPhone(phoneNumber);
  
  if (!user) {
    return res.status(404).json({ 
      success: false, 
      message: '用户不存在，请确认您是已注册的顾客' 
    });
  }
  
  // 检查是否已经参与过
  const hasParticipated = userStore.hasParticipatedToday(phoneNumber);
  
  return res.status(200).json({
    success: true,
    data: {
      userId: user.id,
      phoneNumber: user.phoneNumber,
      name: user.name,
      hasParticipatedToday: hasParticipated
    }
  });
};

// 获取用户参与状态
export const getParticipationStatus = (req: Request, res: Response) => {
  const { phoneNumber } = req.params;
  
  if (!phoneNumber) {
    return res.status(400).json({ 
      success: false, 
      message: '手机号不能为空' 
    });
  }
  
  const hasParticipated = userStore.hasParticipatedToday(phoneNumber);
  
  return res.status(200).json({
    success: true,
    data: {
      hasParticipatedToday: hasParticipated
    }
  });
};

// 标记用户已参与抽奖
export const markAsParticipated = (req: Request, res: Response) => {
  const { phoneNumber } = req.params;
  const { prizeId } = req.body;
  
  if (!phoneNumber) {
    return res.status(400).json({ 
      success: false, 
      message: '手机号不能为空' 
    });
  }
  
  const success = userStore.markAsParticipated(phoneNumber, prizeId);
  
  if (!success) {
    return res.status(400).json({
      success: false,
      message: '用户不存在或今天已经参与过抽奖'
    });
  }
  
  return res.status(200).json({
    success: true,
    message: '成功标记用户已参与抽奖'
  });
};
