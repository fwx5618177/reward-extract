import { Request, Response } from 'express';
import { prizeStore, PrizeConfig } from '../models/prizeModel';
import { loadUsersFromExcel } from '../utils/excelLoader';

// 管理员登录
export const login = (req: Request, res: Response) => {
  const { username, password } = req.body;
  
  // 这里使用简单的硬编码示例，实际项目中应该使用更安全的方式
  if (username === 'admin' && password === 'admin123') {
    return res.status(200).json({
      success: true,
      message: '登录成功',
      token: 'example-token' // 实际项目中应该生成真实的 JWT token
    });
  }
  
  return res.status(401).json({
    success: false,
    message: '用户名或密码错误'
  });
};

// 上传用户 Excel 文件
export const uploadUsers = (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: '没有接收到文件'
    });
  }
  
  try {
    const filePath = req.file.path;
    const count = loadUsersFromExcel(filePath);
    
    return res.status(200).json({
      success: true,
      message: `成功导入 ${count} 名用户数据`
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `导入失败: ${(error as Error).message}`
    });
  }
};

// 获取奖品配置
export const getPrizeConfig = (req: Request, res: Response) => {
  const config = prizeStore.getConfig();
  
  return res.status(200).json({
    success: true,
    data: config
  });
};

// 更新奖品配置
export const updatePrizeConfig = (req: Request, res: Response) => {
  const newConfig: PrizeConfig = req.body;
  
  try {
    prizeStore.updateConfig(newConfig);
    
    return res.status(200).json({
      success: true,
      message: '配置更新成功'
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: (error as Error).message
    });
  }
};
