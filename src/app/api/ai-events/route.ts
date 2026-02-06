import { NextRequest, NextResponse } from 'next/server';

// 定义动态路由配置，禁用缓存
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// 缓存配置
const CACHE_KEY = 'ai_events_data';
const CACHE_DURATION = 3600000; // 1小时

// DeepSeek API配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';

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

// 带超时的 fetch 函数
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 30000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`请求超时（${timeout}ms）`);
    }
    throw error;
  }
}

// 使用DeepSeek生成AI新闻
async function fetchAINews(): Promise<NewsItem[]> {
  console.log('[AI Events] 使用DeepSeek生成AI新闻');

  // 如果没有配置API Key，使用备用数据
  if (!DEEPSEEK_API_KEY) {
    console.log('[AI Events] 未配置DeepSeek API Key，使用备用数据');
    return getFallbackNews();
  }

  try {
    const prompt = `请生成今天（${new Date().toLocaleDateString('zh-CN')}）的AI领域新闻，要求：
1. 生成30条最新的AI相关新闻
2. 每条新闻包含：标题（简洁）、摘要（100-200字）、来源（知名科技媒体）、分类（大模型、AI应用、开源模型、AI硬件、自动驾驶等）
3. 确保新闻内容真实、有代表性
4. 按照以下JSON格式返回：

[
  {
    "title": "新闻标题",
    "summary": "新闻摘要",
    "source": "新闻来源",
    "category": "新闻分类"
  }
]

注意：只返回JSON数组，不要有其他内容。`;

    const response = await fetchWithTimeout('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的AI新闻助手，擅长生成准确、及时的AI领域新闻。',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 8000,
      }),
    }, 60000); // DeepSeek API 超时 60 秒

    if (!response.ok) {
      console.error('[AI Events] DeepSeek API 调用失败:', response.status);
      return getFallbackNews();
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      console.log('[AI Events] DeepSeek返回内容为空，使用备用数据');
      return getFallbackNews();
    }

    // 解析JSON响应
    let newsData: any[];
    try {
      // 提取JSON部分（可能包含markdown代码块）
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      const jsonStr = jsonMatch ? jsonMatch[0] : content;
      newsData = JSON.parse(jsonStr);
    } catch (e) {
      console.error('[AI Events] 解析DeepSeek响应失败:', e);
      console.log('[AI Events] 原始内容:', content);
      return getFallbackNews();
    }

    if (!Array.isArray(newsData) || newsData.length === 0) {
      console.log('[AI Events] DeepSeek返回数据格式错误，使用备用数据');
      return getFallbackNews();
    }

    // 转换为标准格式
    const news: NewsItem[] = newsData.slice(0, 30).map((item, index) => {
      // 根据新闻类型选择不同的搜索平台
      let newsUrl: string;
      const encodedTitle = encodeURIComponent(item.title);

      switch(item.category) {
        case 'AI应用':
        case '自动驾驶':
          newsUrl = `https://36kr.com/search/articles/${encodedTitle}`;
          break;
        case 'AI硬件':
        case '自动驾驶':
          newsUrl = `https://www.leiphone.com/search?keyword=${encodedTitle}`;
          break;
        case '大模型':
        case '开源模型':
          newsUrl = `https://www.infoq.cn/search/${encodedTitle}`;
          break;
        case 'AI安全':
          newsUrl = `https://www.freebuf.com/search?keyword=${encodedTitle}`;
          break;
        default:
          newsUrl = `https://news.google.com/search?q=${encodedTitle}`;
      }

      return {
        id: `${Date.now()}-${index}`,
        title: item.title || 'AI新闻',
        summary: item.summary || '暂无摘要',
        source: item.source || 'DeepSeek',
        url: newsUrl,
        publishedAt: new Date().toISOString(),
        category: item.category || 'AI新闻',
        imageUrl: getNewsImage(index),
      };
    });

    console.log(`[AI Events] 成功从DeepSeek获取 ${news.length} 条新闻`);
    return news;
  } catch (error) {
    console.error('[AI Events] DeepSeek调用失败，使用备用数据:', error);
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
      url: 'https://36kr.com/search/articles/AI技术创新',
      publishedAt: new Date().toISOString(),
      category: 'AI新闻',
      imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=450&fit=crop',
    },
    {
      id: '2',
      title: '大模型技术突破',
      summary: '各大科技公司在大模型领域取得重要进展，性能不断提升。',
      source: 'Tech News',
      url: 'https://www.infoq.cn/search/大模型技术',
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
      category: '大模型',
      imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=450&fit=crop',
    },
    {
      id: '3',
      title: 'AI 应用场景扩展',
      summary: '人工智能在医疗、教育、金融等领域的应用不断拓展。',
      source: 'Industry Report',
      url: 'https://36kr.com/search/articles/AI应用',
      publishedAt: new Date(Date.now() - 7200000).toISOString(),
      category: 'AI应用',
      imageUrl: 'https://images.unsplash.com/photo-1676299081847-824916de030a?w=800&h=450&fit=crop',
    },
    {
      id: '4',
      title: '开源模型生态繁荣',
      summary: '开源大模型项目活跃，推动 AI 技术普及和发展。',
      source: 'Open Source',
      url: 'https://www.infoq.cn/search/开源模型',
      publishedAt: new Date(Date.now() - 10800000).toISOString(),
      category: '开源模型',
      imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=450&fit=crop',
    },
    {
      id: '5',
      title: 'AI 安全与治理',
      summary: '国际社会关注 AI 安全问题，推动 AI 治理框架建设。',
      source: 'Policy Update',
      url: 'https://www.freebuf.com/search?keyword=AI安全',
      publishedAt: new Date(Date.now() - 14400000).toISOString(),
      category: 'AI安全',
      imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&h=450&fit=crop',
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
    const response = await fetchWithTimeout(
      'https://api.github.com/search/repositories?q=topic:artificial-intelligence+topic:machine-learning&sort=stars&order=desc&per_page=10',
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
        },
      },
      15000 // GitHub API 超时 15 秒
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

  // 使用 Promise.allSettled 确保即使一个 API 失败，另一个也能成功
  const [newsResult, reposResult] = await Promise.allSettled([
    fetchAINews(),
    fetchGitHubRepos(),
  ]);

  // 处理新闻数据
  let news: NewsItem[] = [];
  if (newsResult.status === 'fulfilled') {
    news = newsResult.value;
  } else {
    console.error('[AI Events] 获取新闻失败:', newsResult.reason);
    news = getFallbackNews();
  }

  // 处理 GitHub 数据
  let githubData: { topRepos: GitHubRepo[]; trendingRepos: GitHubRepo[] } = {
    topRepos: [],
    trendingRepos: [],
  };
  if (reposResult.status === 'fulfilled') {
    githubData = reposResult.value;
  } else {
    console.error('[AI Events] 获取 GitHub 数据失败:', reposResult.reason);
    // GitHub 失败时，返回模拟数据
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
    ];
    githubData = {
      topRepos: mockRepos,
      trendingRepos: mockRepos.slice(0, 5).map((repo, index) => ({
        ...repo,
        starsGrowth: Math.floor(Math.random() * 5000) + 1000 + (4 - index) * 1000,
      })),
    };
  }

  const data: AIEventsData = {
    news,
    topRepos: githubData.topRepos,
    trendingRepos: githubData.trendingRepos,
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
    console.error('[AI Events] API error，返回备用数据:', error);

    // 即使出错，也尝试获取 GitHub 仓库数据
    let githubData: { topRepos: GitHubRepo[]; trendingRepos: GitHubRepo[] } = { topRepos: [], trendingRepos: [] };
    try {
      githubData = await fetchGitHubRepos();
    } catch (githubError) {
      console.error('[AI Events] GitHub API 也失败了:', githubError);
    }

    // 返回包含备用新闻和 GitHub 数据的响应
    return NextResponse.json({
      news: getFallbackNews(),
      topRepos: githubData.topRepos,
      trendingRepos: githubData.trendingRepos,
      lastUpdated: new Date().toISOString(),
      error: '部分数据加载失败，使用备用数据',
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Content-Type': 'application/json',
      },
    });
  }
}
