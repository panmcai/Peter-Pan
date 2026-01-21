'use client';

import { ArrowRight, Code, BookOpen, Wrench, Users, TrendingUp, Palette } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

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
  const [visitorCount, setVisitorCount] = useState(0);
  const [currentTheme, setCurrentTheme] = useState('default');
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // 从localStorage获取或初始化访问计数
    const stored = localStorage.getItem('visitorCount');
    const count = stored ? parseInt(stored) : Math.floor(Math.random() * 1000) + 500;
    localStorage.setItem('visitorCount', String(count + 1));
    setVisitorCount(count + 1);

    // 从localStorage获取保存的主题
    const savedTheme = localStorage.getItem('backgroundTheme');
    if (savedTheme && backgroundThemes.find(t => t.id === savedTheme)) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  const quickLinks = [
    {
      title: '技术博客',
      description: '分享编程知识、技术见解和最佳实践',
      icon: BookOpen,
      href: '/blog',
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: '实用工具',
      description: '开发工具集合，提升你的工作效率',
      icon: Wrench,
      href: '/tools',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  const featuredTools = [
    { name: 'Python包管理', usage: 85, icon: '🐍' },
    { name: 'C++编译器', usage: 78, icon: '⚡' },
    { name: '代码格式化', usage: 72, icon: '✨' },
    { name: '性能分析', usage: 68, icon: '📊' },
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
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { label: '总访问量', value: isMounted ? visitorCount.toLocaleString() : '...', icon: Users },
              { label: '开源项目', value: '12+', icon: Code },
              { label: '技术文章', value: '36+', icon: BookOpen },
              { label: '实用工具', value: '8+', icon: Wrench },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <stat.icon className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
                <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{stat.value}</p>
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
                className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 transition-all hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900/50"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${link.color} opacity-0 transition-opacity group-hover:opacity-10`} />
                <div className="relative flex items-start gap-4">
                  <div className={`rounded-xl bg-gradient-to-r ${link.color} p-3`}>
                    <link.icon className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                      {link.title}
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400">{link.description}</p>
                  </div>
                  <ArrowRight className="text-zinc-400 transition-transform group-hover:translate-x-1" size={20} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tools Section */}
      <section className="border-t border-zinc-200 bg-zinc-50 px-4 py-20 dark:border-zinc-800 dark:bg-zinc-900/30">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex items-center justify-between">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              热门工具推荐
            </h2>
            <Link
              href="/tools"
              className="flex items-center gap-2 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              查看全部
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {featuredTools.map((tool, index) => (
              <div
                key={index}
                className="rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-blue-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-700"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-2xl">{tool.icon}</span>
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {tool.usage}% 使用率
                  </span>
                </div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                  {tool.name}
                </h3>
                <div className="mt-3 h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                    style={{ width: `${tool.usage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-zinc-200 bg-white px-4 py-20 dark:border-zinc-800 dark:bg-black">
        <div className="mx-auto max-w-4xl text-center">
          <TrendingUp className="mx-auto mb-4 h-12 w-12 text-blue-600 dark:text-blue-400" />
          <h2 className="mb-4 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            开始探索
          </h2>
          <p className="mb-8 text-lg text-zinc-600 dark:text-zinc-400">
            浏览我的博客文章，探索开源项目，或使用实用工具提升你的开发效率。
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/blog"
              className="rounded-full bg-blue-600 px-8 py-3 text-white transition-colors hover:bg-blue-700"
            >
              阅读博客
            </Link>
            <Link
              href="/tools"
              className="rounded-full border-2 border-zinc-300 px-8 py-3 transition-colors hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-600"
            >
              浏览工具
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
