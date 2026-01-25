'use client';

import { useState, useEffect } from 'react';
import { Mail, Github, Linkedin, Twitter, MapPin, Send, MessageCircle, CheckCircle, MessageSquarePlus, Trash2, User } from 'lucide-react';

interface GuestbookEntry {
  id: string;
  name: string;
  content: string;
  timestamp: number;
}

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // 留言板状态
  const [guestbookEntries, setGuestbookEntries] = useState<GuestbookEntry[]>([]);
  const [guestbookForm, setGuestbookForm] = useState({ name: '', content: '' });
  const [isGuestbookSubmitting, setIsGuestbookSubmitting] = useState(false);

  // 加载留言数据
  useEffect(() => {
    const stored = localStorage.getItem('guestbookEntries');
    if (stored) {
      try {
        setGuestbookEntries(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load guestbook entries:', e);
      }
    } else {
      // 初始化一些示例留言
      const initialEntries: GuestbookEntry[] = [
        {
          id: '1',
          name: '张三',
          content: '网站设计很棒！期待更多技术分享。',
          timestamp: Date.now() - 86400000,
        },
        {
          id: '2',
          name: '李四',
          content: 'Python内存管理的文章非常有帮助，感谢分享！',
          timestamp: Date.now() - 43200000,
        },
      ];
      setGuestbookEntries(initialEntries);
      localStorage.setItem('guestbookEntries', JSON.stringify(initialEntries));
    }
  }, []);

  // 添加留言
  const handleGuestbookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestbookForm.name.trim() || !guestbookForm.content.trim()) return;

    setIsGuestbookSubmitting(true);

    const newEntry: GuestbookEntry = {
      id: Date.now().toString(),
      name: guestbookForm.name.trim(),
      content: guestbookForm.content.trim(),
      timestamp: Date.now(),
    };

    await new Promise((resolve) => setTimeout(resolve, 500));

    const updatedEntries = [newEntry, ...guestbookEntries];
    setGuestbookEntries(updatedEntries);
    localStorage.setItem('guestbookEntries', JSON.stringify(updatedEntries));
    setGuestbookForm({ name: '', content: '' });
    setIsGuestbookSubmitting(false);
  };

  // 删除留言
  const deleteEntry = (id: string) => {
    const updatedEntries = guestbookEntries.filter((entry) => entry.id !== id);
    setGuestbookEntries(updatedEntries);
    localStorage.setItem('guestbookEntries', JSON.stringify(updatedEntries));
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return `${minutes} 分钟前`;
      }
      return `${hours} 小时前`;
    } else if (days === 1) {
      return '昨天';
    } else if (days < 7) {
      return `${days} 天前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // 模拟提交
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitted(true);
    setIsSubmitting(false);
    setFormData({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  const socialLinks = [
    {
      name: 'GitHub',
      icon: Github,
      href: 'https://github.com/panmcai',
      description: '查看我的开源项目和代码贡献',
      color: 'hover:bg-zinc-900 dark:hover:bg-zinc-800',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      href: 'https://linkedin.com',
      description: '建立专业联系和职业交流',
      color: 'hover:bg-blue-600 dark:hover:bg-blue-700',
    },
    {
      name: 'Twitter',
      icon: Twitter,
      href: 'https://twitter.com',
      description: '关注我的技术分享和动态',
      color: 'hover:bg-sky-500 dark:hover:bg-sky-600',
    },
    {
      name: 'Email',
      icon: Mail,
      href: 'mailto:panmcai@foxmail.com',
      description: '发送邮件联系我',
      color: 'hover:bg-red-500 dark:hover:bg-red-600',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <section className="border-b border-zinc-200 bg-zinc-50 px-4 py-16 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <MessageCircle className="mx-auto mb-4 h-16 w-16 text-blue-600 dark:text-blue-400" />
            <h1 className="mb-4 text-4xl font-bold text-zinc-900 dark:text-zinc-50">
              联系我
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
              有问题或合作意向？欢迎通过以下方式与我联系
            </p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Info */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                联系方式
              </h2>
              <div className="mb-8 space-y-4">
                <div className="flex items-start gap-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                  <Mail className="mt-1 text-blue-600 dark:text-blue-400" size={20} />
                  <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                      电子邮箱
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400">
                      panmcai@foxmail.com
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                  <MapPin className="mt-1 text-blue-600 dark:text-blue-400" size={20} />
                  <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                      所在地
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400">
                      上海, 中国
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                社交媒体
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-4 transition-all hover:border-blue-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-700 ${social.color}`}
                  >
                    <social.icon className="text-zinc-600 dark:text-zinc-400" size={24} />
                    <div className="flex-1">
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                        {social.name}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-500">
                        {social.description}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                发送消息
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    姓名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-blue-500"
                    placeholder="你的姓名"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    电子邮箱 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-blue-500"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    主题 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-blue-500"
                    placeholder="消息主题"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    消息内容 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-blue-500"
                    placeholder="请输入你的消息..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white font-medium transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? (
                    '发送中...'
                  ) : isSubmitted ? (
                    <>
                      <CheckCircle size={18} />
                      发送成功
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      发送消息
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 留言板 Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-center gap-3">
            <MessageSquarePlus className="text-blue-600 dark:text-blue-400" size={28} />
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              留言板
            </h2>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* 添加留言表单 */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  添加留言
                </h3>
                <form onSubmit={handleGuestbookSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="guestbook-name" className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      昵称 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="guestbook-name"
                      required
                      value={guestbookForm.name}
                      onChange={(e) => setGuestbookForm({ ...guestbookForm, name: e.target.value })}
                      className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-blue-500"
                      placeholder="你的昵称"
                    />
                  </div>
                  <div>
                    <label htmlFor="guestbook-content" className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      留言内容 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="guestbook-content"
                      required
                      rows={4}
                      maxLength={500}
                      value={guestbookForm.content}
                      onChange={(e) => setGuestbookForm({ ...guestbookForm, content: e.target.value })}
                      className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-blue-500"
                      placeholder="写下你的留言..."
                    />
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                      {guestbookForm.content.length}/500
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={isGuestbookSubmitting}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white font-medium transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <MessageSquarePlus size={18} />
                    {isGuestbookSubmitting ? '发布中...' : '发布留言'}
                  </button>
                </form>
              </div>
            </div>

            {/* 留言列表 */}
            <div className="lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  共 {guestbookEntries.length} 条留言
                </p>
              </div>
              <div className="space-y-4">
                {guestbookEntries.length === 0 ? (
                  <div className="flex h-64 items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                    <p className="text-zinc-500 dark:text-zinc-500">
                      还没有留言，快来抢占沙发吧！
                    </p>
                  </div>
                ) : (
                  guestbookEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-xl border border-zinc-200 bg-white p-6 transition-all hover:border-blue-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-700"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                            {entry.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                                <User size={14} className="text-zinc-500 dark:text-zinc-400" />
                                {entry.name}
                              </h4>
                              <span className="text-xs text-zinc-500 dark:text-zinc-500">
                                · {formatDate(entry.timestamp)}
                              </span>
                            </div>
                            <p className="text-zinc-600 dark:text-zinc-400 break-words">
                              {entry.content}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteEntry(entry.id)}
                          className="flex-shrink-0 rounded-lg p-2 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                          aria-label="删除留言"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-t border-zinc-200 bg-zinc-50 px-4 py-16 dark:border-zinc-800 dark:bg-zinc-900/30">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            常见问题
          </h2>
          <div className="space-y-4">
            {[
              {
                question: '如何邀请你参与项目？',
                answer: '你可以通过邮件或LinkedIn联系我，提供项目详情、预期成果和时间框架。我会尽快回复。',
              },
              {
                question: '是否接受技术咨询服务？',
                answer: '是的，我提供C++和Python相关的技术咨询、代码审查和架构设计服务。',
              },
              {
                question: '开源项目如何合作？',
                answer: '欢迎对我的开源项目提交Issue和Pull Request。你也可以在GitHub上讨论新功能或问题。',
              },
            ].map((faq, index) => (
              <details
                key={index}
                className="group rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
              >
                <summary className="flex cursor-pointer items-center justify-between px-6 py-4 font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:text-zinc-50 dark:hover:bg-zinc-800">
                  {faq.question}
                  <svg
                    className="h-5 w-5 transform text-zinc-500 transition-transform group-open:rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <p className="px-6 pb-4 text-zinc-600 dark:text-zinc-400">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
