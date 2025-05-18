export interface User {
  id: string;
  phoneNumber: string;
  name?: string;
  participationHistory: ParticipationRecord[];
}

export interface ParticipationRecord {
  date: string;  // ISO 日期格式: YYYY-MM-DD
  prizeId?: string;  // 如果有中奖，记录奖品ID
}

// 内存数据存储
class UserStore {
  private users: Map<string, User> = new Map();
  
  constructor() {
    // 添加一些测试用户，方便开发调试
    this.addSampleUsers();
  }
  
  // 添加示例用户数据
  private addSampleUsers(): void {
    const sampleUsers: User[] = [
      {
        id: '1',
        phoneNumber: '13800138000',
        name: '张三',
        participationHistory: []
      },
      {
        id: '2',
        phoneNumber: '13900139000',
        name: '李四',
        participationHistory: []
      },
      {
        id: '3',
        phoneNumber: '13700137000',
        name: '王五',
        participationHistory: []
      },
      {
        id: '4',
        phoneNumber: '13600136000',
        name: '赵六',
        participationHistory: []
      }
    ];
    
    sampleUsers.forEach(user => this.addUser(user));
    console.log('已添加示例用户数据用于测试');
  }
  
  // 添加用户
  addUser(user: User): void {
    this.users.set(user.phoneNumber, user);
  }
  
  // 批量添加用户
  addUsers(users: User[]): void {
    users.forEach(user => {
      this.addUser(user);
    });
  }
  
  // 根据手机号获取用户
  getUserByPhone(phoneNumber: string): User | undefined {
    return this.users.get(phoneNumber);
  }
  
  // 检查用户今天是否已参与抽奖
  hasParticipatedToday(phoneNumber: string): boolean {
    const user = this.getUserByPhone(phoneNumber);
    if (!user) return false;
    
    const today = new Date().toISOString().split('T')[0]; // 获取当前日期，格式为 YYYY-MM-DD
    
    return user.participationHistory.some(record => record.date === today);
  }
  
  // 标记用户今天已参与抽奖
  markAsParticipated(phoneNumber: string, prizeId?: string): boolean {
    const user = this.getUserByPhone(phoneNumber);
    if (!user) return false;
    
    const today = new Date().toISOString().split('T')[0];
    
    // 检查是否已经有今天的记录
    if (this.hasParticipatedToday(phoneNumber)) {
      return false;
    }
    
    // 添加参与记录
    user.participationHistory.push({
      date: today,
      prizeId
    });
    
    return true;
  }
  
  // 获取所有用户
  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }
  
  // 清除所有用户数据
  clearAll(): void {
    this.users.clear();
    // 添加示例用户以确保始终有可用数据
    this.addSampleUsers();
  }
}

// 导出单例
export const userStore = new UserStore();
