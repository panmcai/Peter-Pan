'use client';

import { useState, useEffect } from 'react';
import { Github, ExternalLink, MapPin, Mail, Briefcase, GraduationCap, Award, ChevronLeft, ChevronRight } from 'lucide-react';

export default function About() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const workPhotos = [
    { id: 1, title: '在技术大会分享', description: '2024年技术峰会演讲' },
    { id: 2, title: '团队协作', description: '与团队一起攻克技术难题' },
    { id: 3, title: '代码评审', description: '分享代码审查经验' },
    { id: 4, title: '项目演示', description: '新产品功能展示' },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % workPhotos.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + workPhotos.length) % workPhotos.length);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  const skills = [
    { category: '编程语言', items: ['C/C++', 'Python', 'CUDA', 'QT', 'SQL'] },
    { category: '框架与工具', items: ['Docker', 'Git', 'CMake', 'Makefiles', 'GTest', 'AI Agent'] },
    { category: '开发领域', items: ['后端开发', '高性能计算', , "算子与算法优化", '数据工程'] },
  ];

  const experience = [
    {
      period: '2022 - 至今',
      title: '高性能开发工程师',
      company: '某知名科技公司',
      description: '负责核心系统架构设计与优化，领导团队完成多个关键项目，提升系统性能40%以上。',
      highlights: ['主导系统重构', '性能优化', '团队管理'],
    },
    {
      period: '2020 - 2022',
      title: '软件工程师',
      company: '某互联网公司',
      description: '参与大型分布式系统开发，负责后端模块设计与实现，参与开源项目贡献。',
      highlights: ['分布式系统', '开源贡献', '技术分享'],
    },
    {
      period: '2018 - 2020',
      title: '初级软件工程师',
      company: '某软件公司',
      description: '负责产品功能开发与维护，快速学习和掌握新技术栈。',
      highlights: ['功能开发', '代码优化', '技术学习'],
    },
  ];

  const projects = [
    {
      name: '高性能计算框架',
      description: '基于C++开发的高性能并行计算框架，支持多线程和GPU加速',
      tech: ['C++', 'CUDA', 'OpenMP'],
      stars: '1.2k',
      link: '#',
    },
    {
      name: 'Python工具库',
      description: '提供常用数据结构和算法的Python工具库，简化日常开发工作',
      tech: ['Python', 'NumPy', 'Cython', 'Pybind'],
      stars: '850',
      link: '#',
    },
    {
      name: 'Web监控系统',
      description: '基于Next.js开发的实时监控系统，支持多种数据可视化',
      tech: ['Next.js', 'TypeScript', 'D3.js'],
      stars: '620',
      link: '#',
    },
    {
      name: '自动化部署工具',
      description: '简化CI/CD流程的自动化部署工具，支持多种云平台',
      tech: ['Python', 'Docker', 'Kubernetes'],
      stars: '430',
      link: '#',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <section className="border-b border-zinc-200 bg-zinc-50 px-4 py-16 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center text-center md:flex-row md:items-start md:text-left">
            <div className="mb-6 h-32 w-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 md:mb-0 md:mr-8 md:h-40 md:w-40" />
            <div>
              <h1 className="mb-4 text-4xl font-bold text-zinc-900 dark:text-zinc-50">
                高性能开发工程师
              </h1>
              <p className="mb-4 text-lg text-zinc-600 dark:text-zinc-400">
                专注于 C++ 和 Python 开发，热爱技术，追求卓越
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-zinc-600 dark:text-zinc-400 md:justify-start">
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  <span>上海, 中国</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={16} />
                  <span>panmcai@foxmail.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Work Photos Carousel */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-8 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            工作剪影
          </h2>
          <div className="relative overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900">
            <div className="relative h-[400px] bg-gradient-to-br from-blue-500 to-purple-600">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="mb-4 text-6xl">📷</div>
                  <h3 className="mb-2 text-2xl font-bold">{workPhotos[currentSlide].title}</h3>
                  <p className="text-lg opacity-90">{workPhotos[currentSlide].description}</p>
                </div>
              </div>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
                aria-label="Previous photo"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
                aria-label="Next photo"
              >
                <ChevronRight size={24} />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {workPhotos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2 w-2 rounded-full transition-colors ${index === currentSlide ? 'bg-white' : 'bg-white/40'
                      }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="border-t border-zinc-200 bg-zinc-50 px-4 py-16 dark:border-zinc-800 dark:bg-zinc-900/30">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-8 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            技术技能
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {skills.map((skillGroup, index) => (
              <div key={index} className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  {skillGroup.category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skillGroup.items.map((skill, skillIndex) => (
                    <span
                      key={skillIndex}
                      className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience */}
      <section id="experience" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-8 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            工作经历
          </h2>
          <div className="space-y-6">
            {experience.map((job, index) => (
              <div key={index} className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-4 flex flex-col items-start justify-between md:flex-row md:items-center">
                  <div>
                    <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                      {job.title}
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400">
                      {job.company} · {job.period}
                    </p>
                  </div>
                  <div className="mt-2 flex gap-2 md:mt-0">
                    {job.highlights.map((highlight, hi) => (
                      <span
                        key={hi}
                        className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-zinc-600 dark:text-zinc-400">{job.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Education */}
      <section className="border-t border-zinc-200 bg-zinc-50 px-4 py-16 dark:border-zinc-800 dark:bg-zinc-900/30">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-8 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            教育背景
          </h2>
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
                <GraduationCap className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                  电气自动化
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  湖北工业大学 · 2012 - 2016
                </p>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                  致力于解决复杂系统的自动控制与优化问题
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Open Source Projects */}
      <section id="projects" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              开源项目
            </h2>
            <a
              href="https://github.com/panmcai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              <Github size={18} />
              查看GitHub
            </a>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {projects.map((project, index) => (
              <a
                key={index}
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-xl border border-zinc-200 bg-white p-6 transition-all hover:border-blue-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-700"
              >
                <div className="mb-4 flex items-start justify-between">
                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-400">
                    <Github size={16} />
                    <span>{project.stars}</span>
                  </div>
                </div>
                <p className="mb-4 text-zinc-600 dark:text-zinc-400">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.tech.map((tech, ti) => (
                    <span
                      key={ti}
                      className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                  <ExternalLink size={16} />
                  <span className="group-hover:underline">查看项目</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="border-t border-zinc-200 bg-zinc-50 px-4 py-16 dark:border-zinc-800 dark:bg-zinc-900/30">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-8 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            成就与荣誉
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { title: '技术专家认证', year: '2024', description: '获得行业技术专家认证' },
              { title: '优秀开源贡献者', year: '2023', description: 'GitHub开源贡献排名前1%' },
              { title: '最佳技术博客', year: '2023', description: '年度最佳技术博客奖' },
            ].map((achievement, index) => (
              <div key={index} className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-3 flex items-start gap-3">
                  <div className="rounded-full bg-yellow-100 p-2 dark:bg-yellow-900/30">
                    <Award className="text-yellow-600 dark:text-yellow-400" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                      {achievement.title}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-500">{achievement.year}</p>
                  </div>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {achievement.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
