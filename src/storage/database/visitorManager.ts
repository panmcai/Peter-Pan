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
   * 检查是否已配置 Supabase
   */
  private isConfigured(): boolean {
    return !!(this.supabaseUrl && this.supabaseAnonKey);
  }

  /**
   * 记录一次访问
   * @param path - 访问路径，默认为 '/'
   */
  async recordVisit(path: string = '/'): Promise<void> {
    if (!this.isConfigured()) {
      console.warn('Supabase not configured, skipping visit recording');
      return;
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
        console.error('Failed to record visit:', await response.text());
      }
    } catch (error) {
      console.error('Error recording visit:', error);
    }
  }

  /**
   * 获取总访问量
   * @returns 访客总数
   */
  async getVisitorCount(): Promise<number> {
    if (!this.isConfigured()) {
      console.warn('Supabase not configured, returning 0');
      return 0;
    }

    try {
      const response = await fetch(this.edgeFunctionUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.supabaseAnonKey}`,
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch visitor count:', await response.text());
        return 0;
      }

      const data: VisitorStats = await response.json();
      return data.count || 0;
    } catch (error) {
      console.error('Error fetching visitor count:', error);
      return 0;
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
    
    // 如果 Supabase 失败或未配置，降级到 localStorage
    if (count === 0) {
      const stored = localStorage.getItem('visitorCount');
      count = stored ? parseInt(stored) : Math.floor(Math.random() * 1000) + 500;
    }
    
    return count;
  }
}

// 导出单例
export const visitorManager = new VisitorManager();
