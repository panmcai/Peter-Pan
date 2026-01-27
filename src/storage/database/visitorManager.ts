/**
 * 访客管理器（优化版 - 使用数据库函数）
 * 用于管理访客统计数据
 *
 * 优化说明：
 * - 使用 Supabase 数据库函数，原子操作
 * - 一次 API 调用完成记录和更新
 * - 解决并发问题
 * - 性能提升 3x
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
  private restUrl: string;

  constructor() {
    this.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    this.supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    // REST API URL
    const url = this.supabaseUrl.replace(/\/$/, '');
    this.restUrl = `${url}/rest/v1`;
  }

  /**
   * 检查是否在浏览器环境中
   */
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  /**
   * 获取本地存储的访问量
   * 注意：这是降级方案，仅当 Supabase 不可用时使用
   */
  private getLocalCount(): number {
    if (!this.isBrowser()) return 0;

    try {
      const stored = localStorage.getItem('visitorCount');
      return stored ? parseInt(stored) : 0;
    } catch (error) {
      // localStorage 不可用时，返回 0
      return 0;
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
   * 带超时的 fetch 请求
   * @param url - 请求 URL
   * @param options - fetch 选项
   * @param timeout - 超时时间（毫秒），默认 3000ms
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number = 3000
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * 记录一次访问（使用数据库函数，原子操作）
   * 性能优化：从 3 次 API 调用减少到 1 次
   * 并发优化：使用数据库函数确保原子操作，解决并发问题
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
      // 调用数据库函数 record_visit（原子操作，一次 API 调用）
      // 该函数会在单个事务中：
      // 1. 插入 visits 表
      // 2. 更新 visit_stats 表
      const response = await this.fetchWithTimeout(
        `${this.restUrl}/rpc/record_visit`,
        {
          method: 'POST',
          headers: {
            'apikey': this.supabaseAnonKey,
            'Authorization': `Bearer ${this.supabaseAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            p_path: path || '/',
            p_user_agent: this.isBrowser() ? navigator.userAgent : '',
            p_ip: '', // 在客户端无法获取真实 IP
          }),
        },
        3000 // 3 秒超时
      );

      if (!response.ok) {
        // Supabase 请求失败，降级到 localStorage（静默处理，避免触发错误边界）
        console.warn('[VisitorManager] Failed to record visit, using localStorage fallback');
        const currentCount = this.getLocalCount();
        this.setLocalCount(currentCount + 1);
        return false;
      }

      // Supabase 请求成功，清除 localStorage 中的临时值，确保下次从数据库获取
      try {
        localStorage.removeItem('visitorCount');
      } catch (error) {
        // 清除失败时静默处理
      }

      return true; // 表示成功使用 Supabase
    } catch (error) {
      // 网络错误或超时，降级到 localStorage（静默处理，避免触发错误边界）
      console.warn('[VisitorManager] Network error, using localStorage fallback');
      const currentCount = this.getLocalCount();
      this.setLocalCount(currentCount + 1);
      return false;
    }
  }

  /**
   * 获取总访问量（使用数据库函数）
   * 性能优化：直接调用函数，避免查询和解析
   * @returns 访客总数
   */
  async getVisitorCount(): Promise<number> {
    // 如果 Supabase 未配置，直接返回本地计数
    if (!this.isConfigured()) {
      return this.getLocalCount();
    }

    try {
      // 调用数据库函数 get_visit_count
      const response = await this.fetchWithTimeout(
        `${this.restUrl}/rpc/get_visit_count`,
        {
          method: 'POST',
          headers: {
            'apikey': this.supabaseAnonKey,
            'Authorization': `Bearer ${this.supabaseAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}), // 空对象
        },
        3000 // 3 秒超时
      );

      if (!response.ok) {
        // 请求失败，降级到本地计数（静默处理）
        console.warn('[VisitorManager] Failed to fetch visit count, using localStorage fallback');
        return this.getLocalCount();
      }

      // 直接返回数字
      const count = await response.json();
      const numericCount = typeof count === 'number' ? count : parseInt(String(count)) || 0;

      // Supabase 请求成功，清除 localStorage 中的临时值，确保数据一致性
      try {
        localStorage.removeItem('visitorCount');
      } catch (error) {
        // 清除失败时静默处理
      }

      return numericCount;
    } catch (error) {
      // 网络错误或超时，降级到本地计数（静默处理）
      console.warn('[VisitorManager] Network error, using localStorage fallback');
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

  /**
   * 获取详细的统计信息（新功能）
   * @returns 包含 total_visits, today_visits, last_updated_at 的对象
   */
  async getDetailedStats(): Promise<{
    totalVisits: number;
    todayVisits: number;
    lastUpdatedAt: string;
  } | null> {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      const response = await this.fetchWithTimeout(
        `${this.restUrl}/rpc/get_visit_stats`,
        {
          method: 'POST',
          headers: {
            'apikey': this.supabaseAnonKey,
            'Authorization': `Bearer ${this.supabaseAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        },
        3000
      );

      if (!response.ok) {
        return null;
      }

      const stats = await response.json();
      return {
        totalVisits: stats.total_visits || 0,
        todayVisits: stats.today_visits || 0,
        lastUpdatedAt: stats.last_updated_at || '',
      };
    } catch (error) {
      console.warn('[VisitorManager] Failed to fetch detailed stats:', error);
      return null;
    }
  }
}

// 导出单例
export const visitorManager = new VisitorManager();
