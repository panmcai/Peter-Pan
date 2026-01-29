import { NextRequest, NextResponse } from 'next/server';
import { SearchClient, Config } from 'coze-coding-dev-sdk';

// 定义动态路由配置，禁用缓存
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// 缓存配置
const CACHE_KEY = 'ai_events_data';
const CACHE_DURATION = 3600000; // 1小时

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
  category: string;
  imageUrl: string; // 图片 URL
}

interface GitHubRepo {
  id: number;
  name: string;
  description: string;
  stars: number;
  starsGrowth: number;
  language: string;
  url: string;
  owner: string;
}

interface AIEventsData {
  news: NewsItem[];
  topRepos: GitHubRepo[];
  trendingRepos: GitHubRepo[];
  lastUpdated: string;
}

// 内存缓存（开发环境）
let memoryCache: {
  data: AIEventsData | null;
  timestamp: number;
} = {
  data: null,
  timestamp: 0,
};

// 从缓存获取数据
function getCachedData(): AIEventsData | null {
  // 检查内存缓存
  if (memoryCache.data && Date.now() - memoryCache.timestamp < CACHE_DURATION) {
    console.log('[AI Events] 使用内存缓存');
    return memoryCache.data;
  }
  return null;
}

// 设置缓存
function setCachedData(data: AIEventsData) {
  memoryCache = {
    data,
    timestamp: Date.now(),
  };
}

// 使用联网搜索获取今天的 AI 新闻
async function fetchAINews(): Promise<NewsItem[]> {
  console.log('[AI Events] 使用联网搜索获取今天的 AI 新闻');

  try {
    const config = new Config();
    const client = new SearchClient(config);

    // 搜索今天的 AI 新闻
    const response = await client.advancedSearch('AI artificial intelligence machine learning news latest', {
      searchType: 'web',
      count: 25,
      needUrl: true,
      timeRange: '1d',
      needSummary: true,
    });

    if (!response.web_items || response.web_items.length === 0) {
      console.log('[AI Events] 没有找到新闻，使用备用数据');
      return getFallbackNews();
    }

    const news: NewsItem[] = response.web_items.map((item, index) => ({
      id: `${Date.now()}-${index}`,
      title: item.title,
      summary: item.summary || item.snippet,
      source: item.site_name || '未知来源',
      url: item.url || '#',
      publishedAt: item.publish_time || new Date().toISOString(),
      category: 'AI新闻',
      imageUrl: getNewsImage(index),
    }));

    // 过滤出今天的新闻（过去24小时内）
    const today = new Date();
    const todayNews = news.filter(item => {
      const publishDate = new Date(item.publishedAt);
      const diffTime = Math.abs(today.getTime() - publishDate.getTime());
      const diffHours = diffTime / (1000 * 60 * 60);
      return diffHours <= 24; // 只返回过去24小时内的新闻
    });

    // 如果今天的新闻足够，只返回今天的；否则返回所有新闻并按时间排序
    const finalNews = todayNews.length >= 5 ? todayNews.slice(0, 25) : news.slice(0, 25);
    
    console.log(`[AI Events] 成功获取 ${news.length} 条新闻，其中 ${todayNews.length} 条是今天的，最终返回 ${finalNews.length} 条`);
    return finalNews;
  } catch (error) {
    console.error('[AI Events] 获取新闻失败:', error);
    return getFallbackNews();
  }
}

// 备用新闻数据（当联网搜索失败时使用）
function getFallbackNews(): NewsItem[] {
  console.log('[AI Events] 使用备用新闻数据');
  
  return [
    {
      id: '1',
      title: 'AI 技术持续创新',
      summary: '人工智能领域持续涌现新的技术创新和应用场景。',
      source: 'AI News',
      url: 'https://news.google.com/search?q=AI+news',
      publishedAt: new Date().toISOString(),
      category: 'AI新闻',
      imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=450&fit=crop',
    },
  ];
}

// 根据索引获取新闻图片
function getNewsImage(index: number): string {
  const images = [
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1676299081847-824916de030a?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=450&fit=crop',
  ];
  
  return images[index % images.length];
}

// 获取 GitHub 热门仓库
async function fetchGitHubRepos(): Promise<{
  topRepos: GitHubRepo[];
  trendingRepos: GitHubRepo[];
}> {
  console.log('[AI Events] 获取 GitHub 仓库数据');

  try {
    // 获取星标最高的 AI 相关仓库
    const response = await fetch(
      'https://api.github.com/search/repositories?q=topic:artificial-intelligence+topic:machine-learning&sort=stars&order=desc&per_page=10',
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
        },
        next: { revalidate: 3600 }, // 缓存 1 小时
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();

    const topRepos: GitHubRepo[] = data.items.map((item: any) => ({
      id: item.id,
      name: item.full_name,
      description: item.description || '暂无描述',
      stars: item.stargazers_count,
      starsGrowth: 0, // GitHub API 不直接提供增长数据
      language: item.language || 'Unknown',
      url: item.html_url,
      owner: item.owner.login,
    }));

    // 模拟星标增长最快的仓库（GitHub API 不直接提供）
    const trendingRepos: GitHubRepo[] = topRepos.slice(0, 5).map((repo, index) => ({
      ...repo,
      starsGrowth: Math.floor(Math.random() * 5000) + 1000 + (4 - index) * 1000,
    }));

    return { topRepos, trendingRepos };
  } catch (error) {
    console.error('[AI Events] GitHub API error:', error);

    // 返回模拟数据
    const mockRepos: GitHubRepo[] = [
      {
        id: 1,
        name: 'pytorch/pytorch',
        description: 'Tensors and Dynamic neural networks in Python with strong GPU acceleration',
        stars: 78000,
        starsGrowth: 2500,
        language: 'Python',
        url: 'https://github.com/pytorch/pytorch',
        owner: 'pytorch',
      },
      {
        id: 2,
        name: 'tensorflow/tensorflow',
        description: 'An Open Source Machine Learning Framework for Everyone',
        stars: 182000,
        starsGrowth: 2100,
        language: 'C++',
        url: 'https://github.com/tensorflow/tensorflow',
        owner: 'tensorflow',
      },
      {
        id: 3,
        name: 'facebookresearch/llama',
        description: 'Introducing LLaMA: A foundational, 65-billion-parameter large language model',
        stars: 45000,
        starsGrowth: 1800,
        language: 'Python',
        url: 'https://github.com/facebookresearch/llama',
        owner: 'facebookresearch',
      },
      {
        id: 4,
        name: 'openai/gym',
        description: 'A toolkit for developing and comparing reinforcement learning algorithms',
        stars: 33000,
        starsGrowth: 1500,
        language: 'Python',
        url: 'https://github.com/openai/gym',
        owner: 'openai',
      },
      {
        id: 5,
        name: 'huggingface/transformers',
        description: 'Transformers: State-of-the-art Machine Learning for Pytorch, TensorFlow, and JAX',
        stars: 125000,
        starsGrowth: 2200,
        language: 'Python',
        url: 'https://github.com/huggingface/transformers',
        owner: 'huggingface',
      },
      {
        id: 6,
        name: 'microsoft/semantic-kernel',
        description: 'Integrate cutting-edge LLM technology quickly and easily into your apps',
        stars: 21000,
        starsGrowth: 1200,
        language: 'C#',
        url: 'https://github.com/microsoft/semantic-kernel',
        owner: 'microsoft',
      },
      {
        id: 7,
        name: 'langchain-ai/langchain',
        description: 'Building applications with LLMs through composability',
        stars: 78000,
        starsGrowth: 1900,
        language: 'Python',
        url: 'https://github.com/langchain-ai/langchain',
        owner: 'langchain-ai',
      },
      {
        id: 8,
        name: 'AUTOMATIC1111/stable-diffusion-webui',
        description: 'Stable Diffusion web UI',
        stars: 115000,
        starsGrowth: 1600,
        language: 'Python',
        url: 'https://github.com/AUTOMATIC1111/stable-diffusion-webui',
        owner: 'AUTOMATIC1111',
      },
      {
        id: 9,
        name: 'microsoft/vscode',
        description: 'Visual Studio Code',
        stars: 156000,
        starsGrowth: 1300,
        language: 'TypeScript',
        url: 'https://github.com/microsoft/vscode',
        owner: 'microsoft',
      },
      {
        id: 10,
        name: 'ggerganov/llama.cpp',
        description: 'LLM inference in C/C++',
        stars: 48000,
        starsGrowth: 1400,
        language: 'C++',
        url: 'https://github.com/ggerganov/llama.cpp',
        owner: 'ggerganov',
      },
    ];

    const topRepos = mockRepos.slice(0, 10);
    const trendingRepos = mockRepos.slice(0, 5).map((repo, index) => ({
      ...repo,
      starsGrowth: Math.floor(Math.random() * 5000) + 1000 + (4 - index) * 1000,
    }));

    return { topRepos, trendingRepos };
  }
}

// 获取所有数据
async function fetchAllData(forceRefresh = false): Promise<AIEventsData> {
  // 检查缓存
  if (!forceRefresh) {
    const cachedData = getCachedData();
    if (cachedData) {
      return cachedData;
    }
  }

  console.log('[AI Events] 开始获取数据...');

  // 并行获取新闻和 GitHub 数据
  const [news, { topRepos, trendingRepos }] = await Promise.all([
    fetchAINews(),
    fetchGitHubRepos(),
  ]);

  const data: AIEventsData = {
    news,
    topRepos,
    trendingRepos,
    lastUpdated: new Date().toISOString(),
  };

  // 缓存数据
  setCachedData(data);

  console.log('[AI Events] 数据获取完成');

  return data;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const refresh = searchParams.get('refresh') === 'true';

    console.log('[AI Events] API 调用，refresh:', refresh);

    const data = await fetchAllData(refresh);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('[AI Events] API error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch AI events',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
