'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, Star, TrendingUp, Newspaper, Github, Zap, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
  category: string;
  imageUrl: string; // 新增图片字段
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

export default function AIEvents() {
  const [data, setData] = useState<AIEventsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isNewsExpanded, setIsNewsExpanded] = useState(false);

  // 轮播图自动切换
  useEffect(() => {
    if (!data || data.news.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.min(5, data.news.length));
    }, 5000);

    return () => clearInterval(interval);
  }, [data]);

  // 加载数据
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetch(`/api/ai-events?refresh=${forceRefresh}`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('加载数据失败');
      }

      const result = await response.json();
      console.log('[AI Events Page] 加载数据成功:', result);
      setData(result);
      setError(null);
    } catch (err) {
      console.error('[AI Events Page] 加载数据失败:', err);
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadData(true);
  };

  const nextSlide = () => {
    if (!data) return;
    setCurrentSlide((prev) => (prev + 1) % Math.min(5, data.news.length));
  };

  const prevSlide = () => {
    if (!data) return;
    setCurrentSlide((prev) => (prev - 1 + Math.min(5, data.news.length)) % Math.min(5, data.news.length));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Newspaper className="w-8 h-8 animate-pulse text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-zinc-600 dark:text-zinc-400">加载中...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <button
                onClick={() => loadData()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
              >
                <RefreshCw size={16} />
                重试
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data || !data.news) {
    console.log('[AI Events Page] 数据或新闻为空:', data);
    return null;
  }

  console.log('[AI Events Page] 渲染页面，新闻数量:', data.news.length);

  // 计算今天的新闻数量
  const todayNewsCount = data.news.filter(item => {
    const publishDate = new Date(item.publishedAt);
    const today = new Date();
    const diffHours = Math.abs(today.getTime() - publishDate.getTime()) / (1000 * 60 * 60);
    return diffHours <= 24;
  }).length;

  const topNews = data.news.slice(0, 5);
  const remainingNews = data.news.slice(5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              AI 大事件
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              追踪 AI 领域最新动态，发现热门项目
            </p>
          </div>
          <div className="flex items-center gap-4">
            {data.lastUpdated && (
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                最后更新: {new Date(data.lastUpdated).toLocaleString('zh-CN')}
              </span>
            )}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? '刷新中...' : '刷新'}
            </button>
          </div>
        </div>

        {/* 轮播图 - 精选新闻（参考网易云音乐风格） */}
        {topNews.length > 0 && (
          <section className="mb-8">
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg" style={{ height: '200px' }}>
              {/* 主内容区 */}
              {topNews.map((news, index) => (
                <div
                  key={news.id}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    index === currentSlide ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <div className="h-full flex items-center">
                    <div className="container mx-auto px-6">
                      <div className="flex items-center gap-6">
                        {/* 缩略图 */}
                        <div className="hidden sm:block w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-white/10">
                          <img
                            src={news.imageUrl}
                            alt={news.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {/* 内容 */}
                        <div className="flex-1 min-w-0">
                          <div className="inline-flex items-center gap-2 px-2 py-1 mb-2 rounded-full bg-white/20 text-white text-xs">
                            <Newspaper size={12} />
                            {news.category}
                          </div>
                          <h2 className="text-xl md:text-2xl font-bold text-white mb-2 line-clamp-1">
                            {news.title}
                          </h2>
                          <p className="text-sm text-white/80 line-clamp-1">
                            {news.summary}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-white/60">
                            <span>{news.source}</span>
                            <span>•</span>
                            <span>{new Date(news.publishedAt).toLocaleDateString('zh-CN')}</span>
                          </div>
                        </div>
                        {/* 阅读按钮 */}
                        {news.url && (
                          <a
                            href={news.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden md:flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-white/90 transition-colors text-sm font-medium flex-shrink-0"
                          >
                            阅读更多
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* 轮播图控制 */}
              {topNews.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors backdrop-blur-sm"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors backdrop-blur-sm"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {/* 轮播图指示器 - 圆点 */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {topNews.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-1.5 rounded-full transition-all ${
                      index === currentSlide
                        ? 'bg-white w-6'
                        : 'bg-white/40 hover:bg-white/60 w-1.5'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* 缩略图预览条 */}
            {topNews.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-600 scrollbar-track-transparent">
                {topNews.map((news, index) => (
                  <button
                    key={news.id}
                    onClick={() => setCurrentSlide(index)}
                    className={`flex-shrink-0 w-24 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentSlide
                        ? 'border-blue-600 shadow-lg'
                        : 'border-transparent hover:border-zinc-300 dark:hover:border-zinc-600'
                    }`}
                  >
                    <img
                      src={news.imageUrl}
                      alt={news.title}
                      className="w-full h-14 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 新闻列表 - 热门新闻 */}
        {data.news.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <Newspaper className="text-blue-600" />
                热门新闻
                {todayNewsCount > 0 && (
                  <span className="text-sm font-normal text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                    {todayNewsCount} 条今日更新
                  </span>
                )}
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  共 {Math.min(15, data.news.length)} 条
                </span>
                {data.news.length > 3 && (
                  <button
                    onClick={() => setIsNewsExpanded(!isNewsExpanded)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                  >
                    {isNewsExpanded ? '收起' : `展开全部 ${Math.min(15, data.news.length)} 条`}
                  </button>
                )}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.news.slice(0, isNewsExpanded ? 15 : 3).map((news, index) => (
                <a
                  key={news.id}
                  href={news.url || '#'}
                  target={news.url ? '_blank' : undefined}
                  rel={news.url ? 'noopener noreferrer' : undefined}
                  className="block bg-white dark:bg-zinc-900 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden group"
                >
                  {/* 图片 */}
                  <div className="aspect-video overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                    <img
                      src={news.imageUrl || 'https://via.placeholder.com/400x225?text=AI+News'}
                      alt={news.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>

                  {/* 内容 */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                        {news.category}
                      </span>
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">
                        {news.source}
                      </span>
                      {index < 5 && (
                        <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 rounded-full">
                          Top {index + 1}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {news.title}
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-2">
                      {news.summary}
                    </p>
                    <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-500">
                      <span>{new Date(news.publishedAt).toLocaleDateString('zh-CN')}</span>
                      {news.url && <ExternalLink size={14} className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />}
                    </div>
                  </div>
                </a>
              ))}
            </div>
            {/* 底部展开/收起按钮 */}
            {data.news.length > 3 && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setIsNewsExpanded(!isNewsExpanded)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-full hover:border-blue-500 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all font-medium"
                >
                  {isNewsExpanded ? (
                    <>
                      <span>收起</span>
                      <ChevronRight size={16} className="transform rotate-90" />
                    </>
                  ) : (
                    <>
                      <span>展开全部 {Math.min(15, data.news.length)} 条</span>
                      <ChevronRight size={16} className="transform -rotate-90" />
                    </>
                  )}
                </button>
              </div>
            )}
          </section>
        )}
        {/* GitHub 热门仓库 */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Github className="text-zinc-900 dark:text-zinc-50" />
              热门 GitHub 仓库
            </h2>
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              星标最高的 10 个
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {data.topRepos.map((repo) => (
              <a
                key={repo.id}
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                        {repo.name}
                      </h3>
                      <span className="px-2 py-1 text-xs bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 rounded">
                        {repo.language}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                      {repo.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Star size={14} className="fill-current text-yellow-500" />
                        {repo.stars.toLocaleString()} stars
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="text-zinc-400" size={20} />
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* GitHub 趋势仓库 */}
        {data.trendingRepos.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <TrendingUp className="text-green-600" />
                快速增长
              </h2>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                星标增长最快的 5 个
              </span>
            </div>
            <div className="grid gap-4">
              {data.trendingRepos.map((repo) => (
                <a
                  key={repo.id}
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap size={16} className="text-green-600 dark:text-green-400" />
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                          {repo.name}
                        </h3>
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded">
                          {repo.language}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                        {repo.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
                          <Star size={14} className="fill-current text-yellow-500" />
                          {repo.stars.toLocaleString()} stars
                        </span>
                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                          <TrendingUp size={14} />
                          +{repo.starsGrowth.toLocaleString()} 本周
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="text-zinc-400" size={20} />
                  </div>
                </a>
              ))}
            </div>
            {/* 底部展开/收起按钮 */}
            {data.news.length > 3 && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setIsNewsExpanded(!isNewsExpanded)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-full hover:border-blue-500 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all font-medium"
                >
                  {isNewsExpanded ? (
                    <>
                      <span>收起</span>
                      <ChevronRight size={16} className="transform rotate-90" />
                    </>
                  ) : (
                    <>
                      <span>展开全部 {Math.min(15, data.news.length)} 条</span>
                      <ChevronRight size={16} className="transform -rotate-90" />
                    </>
                  )}
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
