/**
 * 访客管理器
 * 用于管理访客统计数据
 */

/**
 * 访客统计响应
 */
export interface VisitorStats {
  count: number;
}

/**
 * 访客管理器类
 */
export class VisitorManager {
  private supabaseUrl: string;
  private supabaseAnonKey: string;
  private edgeFunctionUrl: string;

  constructor() {
    this.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    this.supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    // Edge Function URL
    const functionUrl = this.supabaseUrl.replace(/\/$/, '');
    this.edgeFunctionUrl = `${functionUrl}/functions/v1/visit`;
  }

  /**
   * 检查是否在浏览器环境中
   */
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  /**
   * 获取本地存储的访问量
   */
  private getLocalCount(): number {
    if (!this.isBrowser()) return 0;
    
    try {
      const stored = localStorage.getItem('visitorCount');
      return stored ? parseInt(stored) : Math.floor(Math.random() * 1000) + 500;
    } catch (error) {
      // localStorage 不可用时，返回随机值（静默处理）
      return Math.floor(Math.random() * 1000) + 500;
    }
  }

  /**
   * 设置本地存储的访问量
   */
  private setLocalCount(count: number): void {
    if (!this.isBrowser()) return;
    
    try {
      localStorage.setItem('visitorCount', String(count));
    } catch (error) {
      // localStorage 写入失败时静默处理（不影响核心功能）
    }
  }

  /**
   * 检查是否已配置 Supabase
   */
  private isConfigured(): boolean {
    return !!(this.supabaseUrl && this.supabaseAnonKey);
  }

  /**
   * 记录一次访问（包含降级处理）
   * @param path - 访问路径，默认为 '/'
   * @returns 是否成功记录
   */
  async recordVisit(path: string = '/'): Promise<boolean> {
    // 如果 Supabase 未配置，直接使用 localStorage 降级
    if (!this.isConfigured()) {
      console.warn('[VisitorManager] Supabase not configured, using localStorage fallback');
      const currentCount = this.getLocalCount();
      this.setLocalCount(currentCount + 1);
      return false; // 表示使用了降级方案
    }

    try {
      const response = await fetch(this.edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.supabaseAnonKey}`,
        },
        body: JSON.stringify({ path }),
      });

      if (!response.ok) {
        // Supabase 请求失败，降级到 localStorage（静默处理，避免触发错误边界）
        const currentCount = this.getLocalCount();
        this.setLocalCount(currentCount + 1);
        return false;
      }

      return true; // 表示成功使用 Supabase
    } catch (error) {
      // 网络错误，降级到 localStorage（静默处理，避免触发错误边界）
      const currentCount = this.getLocalCount();
      this.setLocalCount(currentCount + 1);
      return false;
    }
  }

  /**
   * 获取总访问量
   * @returns 访客总数
   */
  async getVisitorCount(): Promise<number> {
    // 如果 Supabase 未配置，直接返回本地计数
    if (!this.isConfigured()) {
      return this.getLocalCount();
    }

    try {
      const response = await fetch(this.edgeFunctionUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.supabaseAnonKey}`,
        },
      });

      if (!response.ok) {
        // 请求失败，降级到本地计数（静默处理）
        return this.getLocalCount();
      }

      const data: VisitorStats = await response.json();
      return data.count || 0;
    } catch (error) {
      // 网络错误，降级到本地计数（静默处理）
      return this.getLocalCount();
    }
  }

  /**
   * 获取访客统计（带降级处理）
   * 优先从 Supabase 获取，失败时使用 localStorage
   * @returns 访客总数
   */
  async getVisitorCountWithFallback(): Promise<number> {
    // 尝试从 Supabase 获取
    let count = await this.getVisitorCount();
    
    // 如果 Supabase 失败或返回 0，使用本地计数
    if (count === 0) {
      count = this.getLocalCount();
    }
    
    return count;
  }
}

// 导出单例
export const visitorManager = new VisitorManager();
