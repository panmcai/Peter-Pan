import { NextRequest, NextResponse } from 'next/server';

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

// 使用 AI 大模型获取 AI 新闻
async function fetchAINews(): Promise<NewsItem[]> {
  console.log('[AI Events] 使用 AI 大模型获取新闻');

  // TODO: 集成智谱AI API
  // 这里先使用模拟数据，后续集成真实的 AI 模型
  const mockNews: NewsItem[] = [
    {
      id: '1',
      title: 'OpenAI 发布 GPT-5，性能提升显著',
      summary: 'OpenAI 正式发布 GPT-5，在推理、代码生成和多语言理解方面取得重大突破，性能相比 GPT-4 提升超过 50%。',
      source: 'TechCrunch',
      url: 'https://techcrunch.com/openai-gpt5-release',
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
      category: '大模型',
      imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=450&fit=crop',
    },
    {
      id: '2',
      title: 'Google DeepMind 新算法突破蛋白质折叠预测',
      summary: 'Google DeepMind 发布新的蛋白质折叠预测算法，准确率达到 98%，将加速新药研发进程。',
      source: 'Nature',
      url: 'https://nature.com/deepmind-protein-folding',
      publishedAt: new Date(Date.now() - 7200000).toISOString(),
      category: 'AI for Science',
      imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=450&fit=crop',
    },
    {
      id: '3',
      title: 'Meta 发布开源大模型 Llama 3.5',
      summary: 'Meta 发布 Llama 3.5 系列，包含 70B 和 400B 参数版本，在多项基准测试中表现优异，完全开源。',
      source: 'Hugging Face',
      url: 'https://huggingface.co/meta-llama/llama-3.5',
      publishedAt: new Date(Date.now() - 10800000).toISOString(),
      category: '开源模型',
      imageUrl: 'https://images.unsplash.com/photo-1676299081847-824916de030a?w=800&h=450&fit=crop',
    },
    {
      id: '4',
      title: 'AI 视频生成工具 Sora 正式开放公测',
      summary: 'OpenAI 的 AI 视频生成工具 Sora 正式开放公测，用户可以生成最长 60 秒的高质量视频。',
      source: 'OpenAI Blog',
      url: 'https://openai.com/sora-public-beta',
      publishedAt: new Date(Date.now() - 14400000).toISOString(),
      category: '多模态',
      imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=450&fit=crop',
    },
    {
      id: '5',
      title: 'Apple 集成 AI 功能到 iOS 18',
      summary: 'Apple 在 WWDC 2026 上宣布 iOS 18 将集成全面的 AI 功能，包括智能助手、实时翻译和增强的 Siri。',
      source: 'Apple Newsroom',
      url: 'https://apple.com/ios18-ai-features',
      publishedAt: new Date(Date.now() - 18000000).toISOString(),
      category: '移动端AI',
      imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&h=450&fit=crop',
    },
    {
      id: '6',
      title: 'Anthropic 发布 Claude 4，安全性和推理能力大幅提升',
      summary: 'Anthropic 发布 Claude 4 系列模型，在安全对齐和复杂推理方面取得显著进步，支持 200K 上下文。',
      source: 'Anthropic Blog',
      url: 'https://anthropic.com/claude-4-release',
      publishedAt: new Date(Date.now() - 21600000).toISOString(),
      category: '大模型',
      imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=450&fit=crop',
    },
    {
      id: '7',
      title: 'NVIDIA 发布新 GPU H200，AI 训练速度提升 3 倍',
      summary: 'NVIDIA 发布 H200 GPU，采用 HBM3e 显存，AI 训练速度比 H100 提升 3 倍，能效提升 40%。',
      source: 'NVIDIA News',
      url: 'https://nvidia.com/h200-release',
      publishedAt: new Date(Date.now() - 25200000).toISOString(),
      category: 'AI硬件',
      imageUrl: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=800&h=450&fit=crop',
    },
    {
      id: '8',
      title: 'AI 编程工具 GitHub Copilot X 全面升级',
      summary: 'GitHub Copilot X 推出重大更新，支持多文件编辑、自动化测试生成和更精准的代码建议。',
      source: 'GitHub Blog',
      url: 'https://github.blog/copilot-x-updates',
      publishedAt: new Date(Date.now() - 28800000).toISOString(),
      category: 'AI编程',
      imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=450&fit=crop',
    },
    {
      id: '9',
      title: '微软推出 AI 辅助的医疗诊断系统',
      summary: '微软与多家医院合作推出 AI 辅助医疗诊断系统，在癌症早期检测方面准确率达到 95%。',
      source: 'Microsoft Healthcare',
      url: 'https://microsoft.com/ai-medical-diagnosis',
      publishedAt: new Date(Date.now() - 32400000).toISOString(),
      category: '医疗AI',
      imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=450&fit=crop',
    },
    {
      id: '10',
      title: 'Stable Diffusion 4 发布，图像生成质量飞跃提升',
      summary: 'Stability AI 发布 Stable Diffusion 4，图像生成质量和速度大幅提升，支持 8K 分辨率和视频生成。',
      source: 'Stability AI',
      url: 'https://stability.ai/sd4-release',
      publishedAt: new Date(Date.now() - 36000000).toISOString(),
      category: '图像生成',
      imageUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&h=450&fit=crop',
    },
    {
      id: '11',
      title: 'AI 自动驾驶技术取得新突破',
      summary: 'Tesla FSD Beta v12 发布，使用端到端神经网络，城市道路驾驶准确率达到 99.5%。',
      source: 'Tesla AI Day',
      url: 'https://tesla.com/ai-day-2026',
      publishedAt: new Date(Date.now() - 39600000).toISOString(),
      category: '自动驾驶',
      imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=450&fit=crop',
    },
    {
      id: '12',
      title: 'AI 音乐生成工具 Suno AI v3 发布',
      summary: 'Suno AI v3 发布，可以生成高质量歌曲，支持指定风格、歌词和歌手声线，质量媲美专业制作。',
      source: 'Suno AI Blog',
      url: 'https://suno.ai/v3-release',
      publishedAt: new Date(Date.now() - 43200000).toISOString(),
      category: 'AI音乐',
      imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=450&fit=crop',
    },
    {
      id: '13',
      title: 'AI 辅助科学研究平台上线',
      summary: 'DeepMind 推出 AI 辅助科学研究平台，帮助科学家加速材料发现、药物研发和气候研究。',
      source: 'DeepMind Blog',
      url: 'https://deepmind.com/ai-science-platform',
      publishedAt: new Date(Date.now() - 46800000).toISOString(),
      category: 'AI for Science',
      imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=450&fit=crop',
    },
    {
      id: '14',
      title: 'AI 翻译工具质量达到人类水平',
      summary: '新的 AI 翻译模型在 WMT 基准测试中达到人类翻译水平，支持 100+ 语言对。',
      source: 'Google Research',
      url: 'https://research.google.com/ai-translation-breakthrough',
      publishedAt: new Date(Date.now() - 50400000).toISOString(),
      category: 'NLP',
      imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=450&fit=crop',
    },
    {
      id: '15',
      title: 'AI 语音合成技术突破',
      summary: '新 AI 语音合成技术可以生成几乎无法区分真人的语音，支持情感表达和多角色配音。',
      source: 'OpenAI Research',
      url: 'https://openai.com/voice-synthesis-breakthrough',
      publishedAt: new Date(Date.now() - 54000000).toISOString(),
      category: '语音技术',
      imageUrl: 'https://images.unsplash.com/photo-1589254065878-42c9da997008?w=800&h=450&fit=crop',
    },
    {
      id: '16',
      title: 'AI 个性化教育平台上线',
      summary: 'Khan Academy 推出 AI 个性化教育平台，根据学生学习进度定制教学内容，提升学习效率 40%。',
      source: 'Khan Academy',
      url: 'https://khanacademy.org/ai-education',
      publishedAt: new Date(Date.now() - 57600000).toISOString(),
      category: '教育AI',
      imageUrl: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&h=450&fit=crop',
    },
    {
      id: '17',
      title: 'AI 电商推荐系统升级',
      summary: 'Amazon 升级 AI 推荐系统，通过多模态理解和实时学习，转化率提升 25%。',
      source: 'Amazon Tech',
      url: 'https://amazon.tech/ai-recommendation-upgrade',
      publishedAt: new Date(Date.now() - 61200000).toISOString(),
      category: '电商AI',
      imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=450&fit=crop',
    },
    {
      id: '18',
      title: 'AI 内容审核平台发布',
      summary: '新 AI 内容审核平台可以实时检测文本、图像和视频中的违规内容，准确率达到 99%。',
      source: 'ContentGuard AI',
      url: 'https://contentguard.ai/platform-release',
      publishedAt: new Date(Date.now() - 64800000).toISOString(),
      category: 'AI安全',
      imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=450&fit=crop',
    },
    {
      id: '19',
      title: 'AI 气候预测模型准确性提升',
      summary: '新 AI 气候预测模型可以提前 30 天准确预测极端天气事件，准确率提升 35%。',
      source: 'Climate AI Lab',
      url: 'https://climateai.ai/weather-prediction',
      publishedAt: new Date(Date.now() - 68400000).toISOString(),
      category: 'AI for Science',
      imageUrl: 'https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=800&h=450&fit=crop',
    },
    {
      id: '20',
      title: 'AI 客服系统全面升级',
      summary: '新 AI 客服系统支持多轮对话、情感识别和复杂问题解决，满意度达到 95%。',
      source: 'Zendesk AI',
      url: 'https://zendesk.com/ai-customer-service',
      publishedAt: new Date(Date.now() - 72000000).toISOString(),
      category: 'AI客服',
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop',
    },
    {
      id: '21',
      title: 'AI 金融风控系统上线',
      summary: '新 AI 金融风控系统可以实时检测欺诈交易，误报率降低 60%，处理速度提升 10 倍。',
      source: 'Fintech AI',
      url: 'https://fintech.ai/fraud-detection',
      publishedAt: new Date(Date.now() - 75600000).toISOString(),
      category: '金融AI',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop',
    },
    {
      id: '22',
      title: 'AI 图像识别模型超越人类',
      summary: '新 AI 图像识别模型在 ImageNet 基准测试中准确率达到 99.9%，首次超越人类专家水平。',
      source: 'Google Research',
      url: 'https://research.google.com/image-recognition-breakthrough',
      publishedAt: new Date(Date.now() - 79200000).toISOString(),
      category: '计算机视觉',
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=450&fit=crop',
    },
    {
      id: '23',
      title: 'AI 代码审查工具发布',
      summary: '新 AI 代码审查工具可以自动检测代码缺陷、安全漏洞和性能问题，准确率达到 98%。',
      source: 'GitLab AI',
      url: 'https://gitlab.com/ai-code-review',
      publishedAt: new Date(Date.now() - 82800000).toISOString(),
      category: 'AI编程',
      imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=450&fit=crop',
    },
    {
      id: '24',
      title: 'AI 农业监测系统部署',
      summary: 'AI 农业监测系统通过卫星图像和 IoT 数据，实时监测作物健康，产量提升 20%。',
      source: 'AgriTech AI',
      url: 'https://agritech.ai/crop-monitoring',
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
      category: '农业AI',
      imageUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=450&fit=crop',
    },
    {
      id: '25',
      title: 'AI 虚拟主播技术成熟',
      summary: '新 AI 虚拟主播技术可以实时生成自然的面部表情和肢体语言，成本仅为真人主播的 10%。',
      source: 'Virtual Human Tech',
      url: 'https://virtualhuman.tech/ai-announcer',
      publishedAt: new Date(Date.now() - 90000000).toISOString(),
      category: '虚拟人',
      imageUrl: 'https://images.unsplash.com/photo-1626379953822-baec19c3accd?w=800&h=450&fit=crop',
    },
    {
      id: '26',
      title: 'AI 法律助手上线',
      summary: '新 AI 法律助手可以分析合同、生成法律文书和提供法律建议，准确率达到 95%。',
      source: 'Legal AI',
      url: 'https://legal.ai/assistant-launch',
      publishedAt: new Date(Date.now() - 93600000).toISOString(),
      category: '法律AI',
      imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=450&fit=crop',
    },
    {
      id: '27',
      title: 'AI 智能家居系统升级',
      summary: '新 AI 智能家居系统可以学习用户习惯，自动调节环境，节能 30%。',
      source: 'Smart Home AI',
      url: 'https://smarthome.ai/system-upgrade',
      publishedAt: new Date(Date.now() - 97200000).toISOString(),
      category: '智能家居',
      imageUrl: 'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=800&h=450&fit=crop',
    },
    {
      id: '28',
      title: 'AI 机器人技术突破',
      summary: '新 AI 机器人可以理解复杂指令，在非结构化环境中自主完成任务。',
      source: 'Robotics AI',
      url: 'https://robotics.ai/technology-breakthrough',
      publishedAt: new Date(Date.now() - 100800000).toISOString(),
      category: '机器人',
      imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=450&fit=crop',
    },
    {
      id: '29',
      title: 'AI 游戏NPC系统发布',
      summary: '新 AI 游戏NPC系统可以生成自然的对话和行为，提升游戏沉浸感。',
      source: 'Game AI Tech',
      url: 'https://gameai.tech/npc-system',
      publishedAt: new Date(Date.now() - 104400000).toISOString(),
      category: '游戏AI',
      imageUrl: 'https://images.unsplash.com/photo-1552820728-8b83bb6b2b35?w=800&h=450&fit=crop',
    },
    {
      id: '30',
      title: 'AI 实时翻译眼镜发布',
      summary: '新 AI 翻译眼镜可以实时翻译对话，支持 50+ 语言，延迟低于 0.5 秒。',
      source: 'Tech Innovations',
      url: 'https://techinnovations.ai/translation-glasses',
      publishedAt: new Date(Date.now() - 108000000).toISOString(),
      category: '硬件AI',
      imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=450&fit=crop',
    },
  ];

  return mockNews;
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
        starsGrowth: 3200,
        language: 'Python',
        url: 'https://github.com/facebookresearch/llama',
        owner: 'facebookresearch',
      },
      {
        id: 4,
        name: 'openai/gym',
        description: 'A toolkit for developing and comparing reinforcement learning algorithms.',
        stars: 34000,
        starsGrowth: 1800,
        language: 'Python',
        url: 'https://github.com/openai/gym',
        owner: 'openai',
      },
      {
        id: 5,
        name: 'huggingface/transformers',
        description: 'Transformers: State-of-the-art Machine Learning for Pytorch, TensorFlow, and JAX.',
        stars: 132000,
        starsGrowth: 2800,
        language: 'Python',
        url: 'https://github.com/huggingface/transformers',
        owner: 'huggingface',
      },
      {
        id: 6,
        name: 'microsoft/semantic-kernel',
        description: 'Integrate cutting-edge LLM technology quickly and easily into your apps',
        stars: 18000,
        starsGrowth: 1500,
        language: 'C#',
        url: 'https://github.com/microsoft/semantic-kernel',
        owner: 'microsoft',
      },
      {
        id: 7,
        name: 'langchain-ai/langchain',
        description: 'Building applications with LLMs through composability',
        stars: 85000,
        starsGrowth: 4200,
        language: 'Python',
        url: 'https://github.com/langchain-ai/langchain',
        owner: 'langchain-ai',
      },
      {
        id: 8,
        name: 'AUTOMATIC1111/stable-diffusion-webui',
        description: 'Stable Diffusion web UI',
        stars: 128000,
        starsGrowth: 3500,
        language: 'Python',
        url: 'https://github.com/AUTOMATIC1111/stable-diffusion-webui',
        owner: 'AUTOMATIC1111',
      },
      {
        id: 9,
        name: 'microsoft/vscode',
        description: 'Visual Studio Code',
        stars: 158000,
        starsGrowth: 1900,
        language: 'TypeScript',
        url: 'https://github.com/microsoft/vscode',
        owner: 'microsoft',
      },
      {
        id: 10,
        name: 'ggerganov/llama.cpp',
        description: 'LLM inference in C/C++',
        stars: 56000,
        starsGrowth: 3100,
        language: 'C++',
        url: 'https://github.com/ggerganov/llama.cpp',
        owner: 'ggerganov',
      },
    ];

    const trendingRepos = mockRepos.slice(0, 5).map((repo, index) => ({
      ...repo,
      starsGrowth: Math.floor(Math.random() * 5000) + 1000 + (4 - index) * 1000,
    }));

    return { topRepos: mockRepos, trendingRepos };
  }
}

// 获取所有数据
async function fetchAllData(forceRefresh: boolean): Promise<AIEventsData> {
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
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}
