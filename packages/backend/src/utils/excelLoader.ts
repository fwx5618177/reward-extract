import * as XLSX from 'xlsx';
import { User } from '../models/userModel';
import { userStore } from '../models/userModel';

/**
 * 从 Excel 文件导入用户数据
 * @param filePath Excel 文件路径
 * @returns 导入的用户数量
 */
export function loadUsersFromExcel(filePath: string): number {
  try {
    // 读取 Excel 文件
    const workbook = XLSX.readFile(filePath);
    
    // 获取第一个工作表
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // 将工作表转换为 JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    // 清除当前所有用户数据
    userStore.clearAll();
    
    // 转换为用户数据
    const users: User[] = jsonData.map((row: any, index) => {
      // 优先"会员电话"，其次"手机号"
      const phoneNumber = row['会员电话'] || row['手机号'] || row['手机号码'] || row['电话'] || '';
      if (!phoneNumber) {
        console.warn(`第 ${index + 1} 行数据缺少手机号，已跳过`);
        return null;
      }
      return {
        id: (index + 1).toString(),
        phoneNumber: phoneNumber.toString(),
        name: row['姓名'] || row['会员姓名'] || row['客户名称'] || row['名称'] || '',
        participationHistory: []
      };
    }).filter(Boolean) as User[];
    
    // 导入到存储
    userStore.addUsers(users);
    
    return users.length;
  } catch (error) {
    console.error('处理 Excel 文件失败:', error);
    throw error;
  }
}
