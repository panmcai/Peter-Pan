'use client';

import { ArrowRight, Code, BookOpen, Wrench, Users, Palette } from 'lucide-react';
import Link from 'next/link';
import { useLayoutEffect, useState, useRef } from 'react';
import { visitorManager } from '@/storage/database/visitorManager';

// 背景主题配置
const backgroundThemes = [
  {
    id: 'default',
    name: '默认',
    class: 'from-zinc-50 via-white to-zinc-50 dark:from-black dark:via-zinc-900 dark:to-black',
  },
  {
    id: 'ocean',
    name: '海洋',
    class: 'from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-950 dark:via-cyan-950 dark:to-teal-950',
  },
  {
    id: 'sunset',
    name: '日落',
    class: 'from-orange-50 via-rose-50 to-purple-50 dark:from-orange-950 dark:via-rose-950 dark:to-purple-950',
  },
  {
    id: 'forest',
    name: '森林',
    class: 'from-green-50 via-emerald-50 to-teal-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950',
  },
  {
    id: 'galaxy',
    name: '星空',
    class: 'from-indigo-50 via-violet-50 to-purple-50 dark:from-indigo-950 dark:via-violet-950 dark:to-purple-950',
  },
];

export default function Home() {
  const [visitorCount, setVisitorCount] = useState<number>(0);
  const [currentTheme, setCurrentTheme] = useState('default');
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  // 使用 useRef 防止重复调用
  const isUpdatingRef = useRef(false);

  // 使用 useLayoutEffect 在第一次渲染前立即读取缓存
  useLayoutEffect(() => {
    console.log('📍 [Home] useLayoutEffect triggered');

    // 防止重复执行
    if (isUpdatingRef.current) {
      console.log('📍 [Home] Update already in progress, skipping');
      return;
    }
    isUpdatingRef.current = true;

    // 立即读取 localStorage 缓存
    const cachedCount = localStorage.getItem('visitorCount');
    if (cachedCount) {
      const count = parseInt(cachedCount);
      setVisitorCount(count);
      console.log('📍 [Home] Loaded from cache:', count);
    } else {
      console.log('📍 [Home] No cache found, initial value:', visitorCount);
    }

    // 异步更新最新数据
    const updateLatestCount = async () => {
      console.log('📍 [Home] Updating latest count');

      const sessionKey = 'visit_recorded_session';
      const isRecorded = sessionStorage.getItem(sessionKey);

      console.log('📍 [Home] Session recorded:', isRecorded);

      if (!isRecorded) {
        console.log('📍 [Home] Recording new visit...');
        sessionStorage.setItem(sessionKey, 'true');
        try {
          const result = await visitorManager.recordVisit('/');
          console.log('📍 [Home] recordVisit result:', result);
        } catch (error) {
          console.error('📍 [Home] Failed to record visit:', error);
        }
      } else {
        console.log('📍 [Home] Session already recorded, skipping recordVisit');
      }

      try {
        const latestCount = await visitorManager.getVisitorCountWithFallback();
        console.log('📍 [Home] Got latest count:', latestCount);
        console.log('📍 [Home] Updating visitorCount from', visitorCount, 'to', latestCount);
        setVisitorCount(latestCount);
      } catch (error) {
        console.error('📍 [Home] Failed to get latest count:', error);
      }

      // 重置标志
      isUpdatingRef.current = false;
    };

    updateLatestCount();

    // 从localStorage获取保存的主题
    const savedTheme = localStorage.getItem('backgroundTheme');
    if (savedTheme && backgroundThemes.find(t => t.id === savedTheme)) {
      setCurrentTheme(savedTheme);
    }

    // 预加载 AI 大事件数据
    preloadAIEventsData();
  }, []);

  // 预加载 AI 大事件数据 - 使用 requestIdleCallback 确保不阻塞前端
  const preloadAIEventsData = () => {
    // 使用 requestIdleCallback 在浏览器空闲时执行
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        console.log('[Home] 浏览器空闲，开始预加载 AI 大事件数据...');
        performPreload();
      }, { timeout: 3000 }); // 超时 3 秒后强制执行
    } else {
      // 不支持 requestIdleCallback 时使用 setTimeout 延迟执行
      console.log('[Home] 浏览器不支持 requestIdleCallback，使用延迟加载');
      setTimeout(() => {
        console.log('[Home] 延迟预加载 AI 大事件数据...');
        performPreload();
      }, 2000); // 延迟 2 秒执行
    }
  };

  // 实际执行预加载的函数
  const performPreload = () => {
    console.log('[Home] 执行 AI 大事件数据预加载...');
    try {
      fetch('/api/ai-events', {
        cache: 'no-store',
      }).then(response => {
        if (response.ok) {
          console.log('[Home] AI 大事件数据预加载成功');
        } else {
          console.log('[Home] AI 大事件数据预加载响应异常:', response.status);
        }
      }).catch(error => {
        console.log('[Home] AI 大事件数据预加载失败:', error);
      });
    } catch (error) {
      console.log('[Home] AI 大事件数据预加载异常:', error);
    }
  };

  const quickLinks = [
    {
      title: '实用工具',
      description: '开发工具集合，提升你的工作效率',
      icon: Wrench,
      href: '/tools',
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: '技术博客',
      description: '分享编程知识、技术见解和最佳实践',
      icon: BookOpen,
      href: '/blog',
      color: 'from-purple-500 to-pink-500',
    },
  ];

  const featuredTools = [
    { name: 'RegexTool', usage: 82, icon: '🎯', link: 'https://regexbox.panmcai.dpdns.org/', isSelfDeveloped: true },
    { name: '浮点数可视化工具', usage: 75, icon: '🔢', link: 'https://panmcai.github.io/FloatVisualizer/', isSelfDeveloped: true },
    { name: 'FormatFactory', usage: 68, icon: '🏭', link: 'https://panmcai.github.io/FormatFactory/', isSelfDeveloped: true },
  ];

  const handleThemeChange = (themeId: string) => {
    setCurrentTheme(themeId);
    localStorage.setItem('backgroundTheme', themeId);
    setShowThemeSelector(false);
  };

  const currentThemeData = backgroundThemes.find(t => t.id === currentTheme) || backgroundThemes[0];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentThemeData.class}`}>
      {/* Theme Selector */}
      <div className="fixed bottom-24 right-4 z-40">
        <div className="relative">
          {showThemeSelector && (
            <div className="absolute bottom-16 right-0 mb-2 flex flex-col gap-2 rounded-xl bg-white p-4 shadow-2xl dark:bg-zinc-900">
              {backgroundThemes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-2 text-sm transition-colors ${currentTheme === theme.id
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800'
                    }`}
                >
                  <div className={`h-4 w-4 rounded-full bg-gradient-to-r ${theme.class.split(' ').slice(0, 2).join(' ')}`} />
                  {theme.name}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() => setShowThemeSelector(!showThemeSelector)}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg transition-all hover:scale-110 dark:bg-zinc-900 dark:shadow-zinc-950/50"
            title="切换背景主题"
          >
            <Palette className="text-zinc-600 dark:text-zinc-400" size={24} />
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-6xl">
              2026
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {', '}All In AI
              </span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
              深耕 C++ 与 Python，致力于通过代码解决复杂问题，打造高性能、可扩展的软件基石。在此分享我的技术实践、思考与原创工具，与同道一起探索工程之美。
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/blog"
                className="flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
              >
                阅读博客
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/contact"
                className="rounded-full border-2 border-zinc-300 px-6 py-3 transition-colors hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-600"
              >
                联系我
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-t border-zinc-200 bg-white px-4 py-12 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
            {[
              {
                label: '总访问量',
                value: visitorCount,
                icon: Users,
              },
              { label: '实用工具', value: '11', icon: Wrench },
              { label: '技术文章', value: '6', icon: BookOpen },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <stat.icon className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
                <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            快速导航
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {quickLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all hover:shadow-2xl dark:bg-zinc-900 dark:shadow-zinc-950/50"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${link.color} opacity-0 transition-opacity group-hover:opacity-10`} />
                <div className="relative">
                  <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${link.color}`}>
                    <link.icon className="text-white" size={32} />
                  </div>
                  <h3 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                    {link.title}
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    {link.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tools Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            精选工具
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {featuredTools.map((tool, index) => (
              <a
                key={index}
                href={tool.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl dark:bg-zinc-900 dark:shadow-zinc-950/50"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-4xl">{tool.icon}</span>
                  {tool.isSelfDeveloped && (
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                      自研
                    </span>
                  )}
                </div>
                <h3 className="mb-2 text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  {tool.name}
                </h3>
                <div className="mb-4 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <span className="font-medium">{tool.usage}%</span>
                  <span>使用率</span>
                </div>
                <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all group-hover:from-blue-600 group-hover:to-purple-600"
                    style={{ width: `${tool.usage}%` }}
                  />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white px-4 py-12 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-zinc-600 dark:text-zinc-400">
            © 2026 Peter·Pan. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
