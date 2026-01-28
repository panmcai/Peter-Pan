/**
 * 访客管理器（使用 Next.js API Route）
 * 用于管理访客统计数据
 *
 * 修改说明：
 * - 使用 Next.js API Route 绕过 Supabase REST API 的鉴权问题
 * - 直接连接 PostgreSQL 数据库
 * - 解决 JWT 密钥导致的 POST 请求失败问题
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
  /**
   * 检查是否在浏览器环境中
   */
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  /**
   * 获取本地存储的访问量
   * 注意：这是降级方案，仅当 API 不可用时使用
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
   * 带超时的 fetch 请求
   * @param url - 请求 URL
   * @param options - fetch 选项
   * @param timeout - 超时时间（毫秒），默认 5000ms
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number = 5000
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

      // 区分错误类型，便于调试
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.warn(`[VisitorManager] Request aborted for ${url}:`, error.message);
        } else {
          console.error(`[VisitorManager] Network error for ${url}:`, error);
        }
      }
      throw error;
    }
  }

  /**
   * 记录一次访问（使用 Next.js API route，绕过 Supabase 鉴权问题）
   * @param path - 访问路径，默认为 '/'
   * @returns 是否成功记录
   */
  async recordVisit(path: string = '/'): Promise<boolean> {
    console.log('[VisitorManager] recordVisit called with path:', path);

    try {
      const requestBody = {
        path: path || '/',
        user_agent: this.isBrowser() ? navigator.userAgent : '',
        ip: ''
      };
      console.log('[VisitorManager] Calling Next.js API: /api/visit');
      console.log('[VisitorManager] Request body:', requestBody);

      // 使用 Next.js API route，绕过 Supabase REST API 的鉴权问题
      const response = await this.fetchWithTimeout(
        '/api/visit',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
          },
          cache: 'no-store',
          body: JSON.stringify(requestBody),
        },
        5000 // 5 秒超时
      );

      console.log('[VisitorManager] Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[VisitorManager] API request failed:', errorText);
        // API 请求失败，不修改 localStorage（让 getVisitorCount 处理）
        console.warn('[VisitorManager] Failed to record visit, skipping localStorage update');
        return false;
      }

      console.log('[VisitorManager] API request succeeded');

      // API 请求成功，不要清除 localStorage，保持缓存以便立即显示

      return true;
    } catch (error) {
      // 区分错误类型
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.warn('[VisitorManager] Request aborted (likely page refresh or timeout):', error.message);
        } else {
          console.error('[VisitorManager] Network error:', error);
        }
      } else {
        console.error('[VisitorManager] Unknown error:', error);
      }

      // 网络错误或超时，不修改 localStorage（让 getVisitorCount 处理）
      console.warn('[VisitorManager] Skipping localStorage update, will use cached value');

      return false;
    }
  }

  /**
   * 获取总访问量（使用 Next.js API Route）
   * @returns 访客总数
   */
  async getVisitorCount(): Promise<number> {
    console.log('[VisitorManager] getVisitorCount called');

    try {
      // 调用 Next.js API Route
      const response = await this.fetchWithTimeout(
        '/api/visit',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
          },
          cache: 'no-store',
        },
        3000 // 3 秒超时
      );

      console.log('[VisitorManager] Response status:', response.status, response.statusText);

      if (!response.ok) {
        // 请求失败，降级到本地计数（静默处理）
        console.warn('[VisitorManager] Failed to fetch visit count, using localStorage fallback');
        const localCount = this.getLocalCount();
        console.log('[VisitorManager] Using localStorage count:', localCount);
        return localCount;
      }

      const data = await response.json();
      const count = data.total_visits || 0;

      console.log('[VisitorManager] Got count from API:', count);

      // API 请求成功，更新 localStorage 缓存（而不是清除）
      // 这样可以确保显示最新的值，同时避免重复计数
      try {
        localStorage.setItem('visitorCount', String(count));
      } catch (error) {
        // 更新缓存失败时静默处理
      }

      return count;
    } catch (error) {
      // 区分错误类型
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.warn('[VisitorManager] Request aborted (likely page refresh or timeout):', error.message);
        } else {
          console.error('[VisitorManager] Network error:', error);
        }
      } else {
        console.error('[VisitorManager] Unknown error:', error);
      }

      // 网络错误或超时，降级到本地计数
      console.warn('[VisitorManager] Using localStorage fallback');
      const localCount = this.getLocalCount();
      console.log('[VisitorManager] Using localStorage count:', localCount);
      return localCount;
    }
  }

  /**
   * 获取访问量（带降级方案）
   * @returns 访客总数
   */
  async getVisitorCountWithFallback(): Promise<number> {
    // 尝试从 API 获取
    let count = await this.getVisitorCount();

    // 如果 API 失败或返回 0，使用本地计数
    if (count === 0) {
      count = this.getLocalCount();
    }

    return count;
  }
}

// 导出单例
export const visitorManager = new VisitorManager();
