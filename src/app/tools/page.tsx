'use client';

import Link from 'next/link';
import { ExternalLink, Star, TrendingUp, Search, Code, Terminal, Database, Layout } from 'lucide-react';
import { useState } from 'react';

export default function Tools() {
  const [searchTerm, setSearchTerm] = useState('');

  const featuredTools = [
    {
      name: 'Python包管理工具',
      description: '简化Python项目依赖管理，一键安装、更新和卸载包',
      icon: '🐍',
      category: 'Python',
      usage: 85,
      link: 'https://pypi.org/',
      isNew: false,
    },
    {
      name: '浮点数可视化工具',
      description: '可视化 IEEE 754 浮点数格式，直观理解二进制表示',
      icon: '🔢',
      category: '自研工具',
      usage: 75,
      link: 'https://panmcai.github.io/FloatVisualizer/',
      isNew: true,
    },
    {
      name: 'C++代码格式化',
      description: '自动格式化C++代码，保持代码风格统一',
      icon: '⚡',
      category: 'C++',
      usage: 78,
      link: 'https://clang.llvm.org/docs/ClangFormat.html',
      isNew: false,
    },
    {
      name: '性能分析器',
      description: '分析代码性能瓶颈，优化执行效率',
      icon: '📊',
      category: 'DevOps',
      usage: 72,
      link: 'https://py-spy.readthedocs.io/',
      isNew: false,
    },
  ];

  const allTools = [
    {
      name: 'Python包管理工具',
      description: '简化Python项目依赖管理，一键安装、更新和卸载包',
      icon: '🐍',
      category: 'Python',
      stars: 1200,
      link: 'https://pypi.org/',
      isExternal: true,
      tags: ['Python', '包管理', '开发工具'],
    },
    {
      name: 'C++代码格式化',
      description: '自动格式化C++代码，保持代码风格统一',
      icon: '⚡',
      category: 'C++',
      stars: 850,
      link: 'https://clang.llvm.org/docs/ClangFormat.html',
      isExternal: true,
      tags: ['C++', '代码格式化', '开发工具'],
    },
    {
      name: '性能分析器',
      description: '分析代码性能瓶颈，优化执行效率',
      icon: '📊',
      category: 'DevOps',
      stars: 620,
      link: 'https://py-spy.readthedocs.io/',
      isExternal: true,
      tags: ['性能分析', '优化', '开发工具'],
    },
    {
      name: 'Docker容器管理',
      description: '简化Docker容器和镜像的管理操作',
      icon: '🐳',
      category: 'DevOps',
      stars: 540,
      link: 'https://www.docker.com/',
      isExternal: true,
      tags: ['Docker', '容器', 'DevOps'],
    },
    {
      name: 'Git代码管理',
      description: '版本控制系统，跟踪代码变更历史',
      icon: '📝',
      category: 'DevOps',
      stars: 480,
      link: 'https://git-scm.com/',
      isExternal: true,
      tags: ['Git', '版本控制', '开发工具'],
    },
    {
      name: 'SQL数据库工具',
      description: '可视化的数据库管理工具，简化SQL操作',
      icon: '🗃️',
      category: 'Database',
      stars: 380,
      link: 'https://dbeaver.io/',
      isExternal: true,
      tags: ['SQL', '数据库', '开发工具'],
    },
    {
      name: 'API测试工具',
      description: '测试和调试API接口的实用工具',
      icon: '🔌',
      category: 'DevOps',
      stars: 320,
      link: 'https://www.postman.com/',
      isExternal: true,
      tags: ['API', '测试', '开发工具'],
    },
    {
      name: '日志分析工具',
      description: '分析应用日志，快速定位问题',
      icon: '📋',
      category: 'DevOps',
      stars: 280,
      link: 'https://www.elastic.co/',
      isExternal: true,
      tags: ['日志', '分析', '开发工具'],
    },
    {
      name: '代码检查工具',
      description: '静态代码分析，提前发现潜在问题',
      icon: '🔍',
      category: 'Python',
      stars: 240,
      link: 'https://pycqa.github.io/isort/',
      isExternal: true,
      tags: ['Python', '代码检查', '开发工具'],
    },
    {
      name: '项目模板生成器',
      description: '快速生成项目脚手架，节省初始化时间',
      icon: '🚀',
      category: 'DevOps',
      stars: 210,
      link: 'https://cookiecutter.readthedocs.io/',
      isExternal: true,
      tags: ['脚手架', '项目模板', '开发工具'],
    },
    {
      name: '浮点数可视化工具',
      description: '可视化 IEEE 754 浮点数格式，直观理解二进制表示',
      icon: '🔢',
      category: '自研工具',
      stars: 150,
      link: 'https://panmcai.github.io/FloatVisualizer/',
      isExternal: true,
      tags: ['浮点数', '可视化', '工具', '自研'],
    },
  ];

  const categories = ['全部', '自研工具', 'C++', 'Python', 'DevOps', 'Database'];
  const [selectedCategory, setSelectedCategory] = useState('全部');

  // 定义类目优先级
  const categoryPriority: Record<string, number> = {
    '自研工具': 1,
    'C++': 2,
    'Python': 3,
    'DevOps': 4,
    'Database': 5,
  };

  const filteredTools = allTools.filter((tool) => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === '全部' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    // 当选择了特定类目时，按照星数排序
    if (selectedCategory !== '全部') {
      return b.stars - a.stars;
    }
    // 当选择"全部"时，按照类目优先级排序
    const priorityA = categoryPriority[a.category] ?? 999;
    const priorityB = categoryPriority[b.category] ?? 999;
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    // 同一类目内按星数排序
    return b.stars - a.stars;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <section className="border-b border-zinc-200 bg-zinc-50 px-4 py-16 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold text-zinc-900 dark:text-zinc-50">
              实用工具集
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
              提升开发效率的实用工具，助力日常工作
            </p>
          </div>
        </div>
      </section>

      {/* Featured Tools */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-center gap-2">
            <TrendingUp className="text-blue-600 dark:text-blue-400" size={24} />
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              高频工具推荐
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {featuredTools.map((tool, index) => (
              <a
                key={index}
                href={tool.link}
                className={`group relative overflow-hidden rounded-xl border-2 bg-white p-6 transition-all hover:shadow-xl dark:bg-zinc-900 ${
                  tool.category === '自研工具'
                    ? 'border-green-300 hover:border-green-500 dark:border-green-700 dark:hover:border-green-500'
                    : 'border-blue-200 hover:border-blue-400 dark:border-blue-900/50 dark:hover:border-blue-700'
                }`}
              >
                {(tool.isNew || tool.category === '自研工具') && (
                  <span className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-xs font-medium text-white ${
                    tool.category === '自研工具'
                      ? 'bg-green-500'
                      : 'bg-red-500'
                  }`}>
                    {tool.category === '自研工具' ? '自研' : 'NEW'}
                  </span>
                )}
                <div className="mb-4 text-4xl">{tool.icon}</div>
                <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  {tool.name}
                </h3>
                <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                  {tool.description}
                </p>
                <div className="mb-2">
                  <div className="mb-1 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-500">
                    <span>使用率</span>
                    <span>{tool.usage}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-800">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                      style={{ width: `${tool.usage}%` }}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    {tool.category}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* All Tools */}
      <section className="border-t border-zinc-200 bg-zinc-50 px-4 py-16 dark:border-zinc-800 dark:bg-zinc-900/30">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-8 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            全部工具
          </h2>

          {/* Search and Filter */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
              <input
                type="text"
                placeholder="搜索工具..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-10 pr-4 text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-blue-500"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'border border-zinc-300 text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Tools Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTools.length === 0 ? (
              <div className="col-span-full py-12 text-center text-zinc-500 dark:text-zinc-400">
                没有找到匹配的工具
              </div>
            ) : (
              filteredTools.map((tool, index) => (
                <a
                  key={index}
                  href={tool.link}
                  target={tool.isExternal ? '_blank' : undefined}
                  rel={tool.isExternal ? 'noopener noreferrer' : undefined}
                  className={`group flex flex-col overflow-hidden rounded-xl border bg-white transition-all hover:shadow-lg dark:bg-zinc-900 ${
                    tool.category === '自研工具'
                      ? 'border-2 border-green-300 hover:border-green-500 dark:border-green-700 dark:hover:border-green-500'
                      : 'border-zinc-200 hover:border-blue-300 dark:border-zinc-800 dark:hover:border-blue-700'
                  }`}
                >
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="text-4xl">{tool.icon}</div>
                      <div className="flex gap-2">
                        {tool.category === '自研工具' && (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                            自研
                          </span>
                        )}
                        {tool.isExternal ? (
                          <ExternalLink className="text-zinc-400" size={18} />
                        ) : (
                          <Code className="text-zinc-400" size={18} />
                        )}
                      </div>
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {tool.name}
                    </h3>
                    <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                      {tool.description}
                    </p>
                    <div className="mt-auto">
                      <div className="mb-3 flex flex-wrap gap-2">
                        {tool.tags.slice(0, 3).map((tag, ti) => (
                          <span
                            key={ti}
                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                              tool.category === '自研工具'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className={`flex items-center gap-2 text-sm ${
                        tool.category === '自研工具'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-zinc-500 dark:text-zinc-500'
                      }`}>
                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                        <span>{tool.stars}</span>
                        <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                          tool.category === '自研工具'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-zinc-100 dark:bg-zinc-800'
                        }`}>
                          {tool.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Contribute Section */}
      <section className="border-t border-zinc-200 px-4 py-16 dark:border-zinc-800">
        <div className="mx-auto max-w-4xl text-center">
          <Terminal className="mx-auto mb-4 h-12 w-12 text-blue-600 dark:text-blue-400" />
          <h2 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            贡献你的工具
          </h2>
          <p className="mb-8 text-lg text-zinc-600 dark:text-zinc-400">
            如果你开发了实用的工具，欢迎分享到社区，帮助更多开发者
          </p>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-3 text-white transition-colors hover:bg-blue-700"
          >
            <Code size={18} />
            提交你的工具
          </a>
        </div>
      </section>
    </div>
  );
}
