export interface Prize {
  id: string;
  name: string;
  level: number; // 1=一等奖, 2=二等奖, 3=三等奖, 4=参与奖
  description: string;
  imageUrl?: string;
  stock: number; // 奖品库存数量
}

export interface PrizeConfig {
  probabilities: { [level: number]: number }; // 各等级奖品概率配置
}

// 内存数据存储
class PrizeStore {
  private prizes: Prize[] = [];
  private config: PrizeConfig = {
    probabilities: {
      1: 5,  // 一等奖 5%
      2: 15, // 二等奖 15%
      3: 30, // 三等奖 30%
      4: 50  // 参与奖 50%
    }
  };
  
  constructor() {
    this.initDefaultPrizes();
  }
  
  private initDefaultPrizes(): void {
    this.prizes = [
      {
        id: '1',
        name: '豪华大礼包',
        level: 1,
        description: '价值1000元的豪华大礼包',
        imageUrl: '/assets/prize-1.png',
        stock: 3
      },
      {
        id: '2',
        name: '精美礼品',
        level: 2,
        description: '价值500元的精美礼品',
        imageUrl: '/assets/prize-2.png',
        stock: 10
      },
      {
        id: '3',
        name: '纪念礼品',
        level: 3,
        description: '价值200元的纪念礼品',
        imageUrl: '/assets/prize-3.png',
        stock: 30
      },
      {
        id: '4',
        name: '参与奖',
        level: 4,
        description: '感谢参与',
        imageUrl: '/assets/prize-4.png',
        stock: 200
      }
    ];
  }
  
  // 获取所有奖品
  getAllPrizes(): Prize[] {
    return [...this.prizes];
  }
  
  // 根据ID获取奖品
  getPrizeById(id: string): Prize | undefined {
    return this.prizes.find(prize => prize.id === id);
  }
  
  // 根据等级获取奖品
  getPrizesByLevel(level: number): Prize[] {
    return this.prizes.filter(prize => prize.level === level && prize.stock > 0);
  }
  
  // 抽奖
  drawPrize(): Prize | null {
    // 确定奖品等级
    const level = this.determineLevel();
    const availablePrizes = this.getPrizesByLevel(level);
    
    if (availablePrizes.length === 0) {
      // 如果该等级没有库存，尝试更低一级的奖品
      for (let l = level + 1; l <= 4; l++) {
        const lowerPrizes = this.getPrizesByLevel(l);
        if (lowerPrizes.length > 0) {
          const randomIndex = Math.floor(Math.random() * lowerPrizes.length);
          const prize = lowerPrizes[randomIndex];
          // 减少库存
          this.decreaseStock(prize.id);
          return prize;
        }
      }
      return null; // 所有奖品都没有库存了
    }
    
    // 从该等级的奖品中随机选择一个
    const randomIndex = Math.floor(Math.random() * availablePrizes.length);
    const prize = availablePrizes[randomIndex];
    
    // 减少库存
    this.decreaseStock(prize.id);
    
    return prize;
  }
  
  // 减少奖品库存
  private decreaseStock(prizeId: string): void {
    const prize = this.getPrizeById(prizeId);
    if (prize && prize.stock > 0) {
      prize.stock -= 1;
    }
  }
  
  // 确定中奖等级
  private determineLevel(): number {
    // 生成0-100的随机数
    const random = Math.random() * 100;
    
    // 按概率确定奖品等级
    let cumulativeProbability = 0;
    for (let level = 1; level <= 4; level++) {
      cumulativeProbability += this.config.probabilities[level] || 0;
      if (random <= cumulativeProbability) {
        return level;
      }
    }
    
    // 默认返回参与奖
    return 4;
  }
  
  // 更新奖品配置
  updateConfig(newConfig: PrizeConfig): void {
    // 验证概率总和是否为100%
    const totalProbability = Object.values(newConfig.probabilities).reduce((sum, prob) => sum + prob, 0);
    if (Math.abs(totalProbability - 100) > 0.01) { // 允许0.01的误差
      throw new Error('奖品概率总和必须为100%');
    }
    
    this.config = { ...newConfig };
  }
  
  // 获取奖品配置
  getConfig(): PrizeConfig {
    return { ...this.config };
  }
  
  // 更新奖品信息
  updatePrize(prizeId: string, updates: Partial<Prize>): boolean {
    const index = this.prizes.findIndex(p => p.id === prizeId);
    if (index === -1) return false;
    
    this.prizes[index] = { ...this.prizes[index], ...updates };
    return true;
  }
}

// 导出单例
export const prizeStore = new PrizeStore();
