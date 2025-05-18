import { Request, Response, NextFunction } from 'express';

// 简单的身份验证中间件
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // 从请求头中获取 token
  const token = req.headers.authorization?.split(' ')[1];
  
  // 这里使用简化的检查方式，实际项目中应该使用 JWT 验证
  if (!token || token !== 'example-token') {
    return res.status(401).json({
      success: false,
      message: '未授权访问，请先登录'
    });
  }
  
  // 验证通过，继续执行
  next();
}; 