'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, Clock, Trash2, Settings, AlertCircle } from 'lucide-react';
import ModelConfig, { AIModelConfig } from '@/components/ModelConfig';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '你好！我是 Peter·Pan 的 AI 助手。我可以帮助你回答问题、提供信息或者只是聊聊天。\n\n⚠️ 请先点击右上角的「设置」按钮配置大模型。\n\n💡 推荐使用 **智谱 AI** 的 **GLM-4-Flash** 模型，这是一款极速大模型，性能优秀，适合日常使用。',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [modelConfig, setModelConfig] = useState<AIModelConfig | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const initialMessageCountRef = useRef<number>(1); // 初始有1条欢迎消息

  // 从 localStorage 加载配置
  useEffect(() => {
    const saved = localStorage.getItem('current-model-config');
    if (saved) {
      setModelConfig(JSON.parse(saved));
    }
    // 页面加载时滚动到顶部
    window.scrollTo(0, 0);
  }, []);

  // 保存配置到 localStorage
  useEffect(() => {
    if (modelConfig) {
      localStorage.setItem('current-model-config', JSON.stringify(modelConfig));
    }
  }, [modelConfig]);

  // 自动滚动到底部（只在有新消息时）
  const scrollToBottom = () => {
    // 只在消息数量大于初始数量时才滚动
    if (messages.length > initialMessageCountRef.current) {
      messagesContainerRef.current?.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    // 检查是否配置了模型
    if (!modelConfig) {
      setError('请先配置大模型 API Key');
      setShowConfig(true);
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    // 添加用户消息
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          model: modelConfig.models[0],
          provider: modelConfig.provider,
          apiKey: modelConfig.apiKey,
          baseUrl: modelConfig.baseUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '请求失败');
      }

      const data = await response.json();

      // 添加 AI 回复
      let assistantContent = '';
      if (data.choices && data.choices[0] && data.choices[0].message) {
        assistantContent = data.choices[0].message.content;
      } else if (data.content && data.content[0]) {
        // Anthropic 格式
        assistantContent = data.content[0].text;
      }

      if (!assistantContent) {
        throw new Error('未收到有效回复');
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '发送失败';
      setError(errorMessage);

      // 添加错误消息
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `❌ 抱歉，发生了错误：\n\n${errorMessage}\n\n请检查您的 API Key 是否正确，或者尝试重新配置模型。`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    const newMessages: Message[] = [
      {
        role: 'assistant',
        content: modelConfig
          ? '你好！我是 Peter·Pan 的 AI 助手。我可以帮助你回答问题、提供信息或者只是聊聊天。请问有什么我可以帮助你的吗？'
          : '你好！我是 Peter·Pan 的 AI 助手。我可以帮助你回答问题、提供信息或者只是聊聊天。\n\n⚠️ 请先点击右上角的「设置」按钮配置大模型。\n\n💡 推荐使用 **智谱 AI** 的 **GLM-4-Flash** 模型，这是一款极速大模型，性能优秀，适合日常使用。',
        timestamp: new Date(),
      },
    ];
    setMessages(newMessages);
    setError(null);
    // 更新初始消息计数
    initialMessageCountRef.current = newMessages.length;
  };

  const handleConfigChange = (config: AIModelConfig) => {
    setModelConfig(config);
    // 清空消息，显示配置成功提示
    const newMessages: Message[] = [
      {
        role: 'assistant',
        content: `✅ 已成功配置 ${config.name} (${config.models[0]})\n\n现在可以开始对话了！`,
        timestamp: new Date(),
      },
    ];
    setMessages(newMessages);
    // 更新初始消息计数
    initialMessageCountRef.current = newMessages.length;
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes} 分钟前`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} 小时前`;
    return date.toLocaleDateString('zh-CN');
  };

  const getProviderIcon = (provider: string) => {
    const icons: Record<string, string> = {
      zhipu: '🤖',
      openai: '🌐',
      anthropic: '🧠',
      deepseek: '🔍',
      qwen: '🌟',
      moonshot: '🌙',
      baichuan: '🌊',
      yi: '💎',
    };
    return icons[provider] || '🤖';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-blue-50/30 to-purple-50/30 dark:from-zinc-950 dark:via-blue-950/20 dark:to-purple-950/20">
      {/* 顶部导航 */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  Peter·Pan AI 助手
                </h1>
                <div className="flex items-center gap-2">
                  {modelConfig ? (
                    <>
                      <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full flex items-center gap-1">
                        {getProviderIcon(modelConfig.provider)}
                        {modelConfig.name}
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {modelConfig.models[0]}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      未配置模型
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowConfig(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg transition-all"
                title="配置模型"
              >
                <Settings size={16} />
                <span className="hidden sm:inline">设置</span>
              </button>
              <button
                onClick={clearChat}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all"
                title="清空对话"
              >
                <Trash2 size={16} />
                <span className="hidden sm:inline">清空</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 消息区域 */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-600/20 dark:shadow-blue-600/40">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-4 shadow-sm ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-blue-600/20'
                      : 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                    {message.content}
                  </p>
                  {message.timestamp && (
                    <div
                      className={`flex items-center gap-1 mt-2 text-xs ${
                        message.role === 'user'
                          ? 'text-blue-100'
                          : 'text-zinc-400 dark:text-zinc-500'
                      }`}
                    >
                      <Clock size={12} />
                      <span>{formatTime(message.timestamp)}</span>
                    </div>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-zinc-600 dark:bg-zinc-700 flex items-center justify-center shadow-lg">
                    <User className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-4 justify-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="bg-white dark:bg-zinc-800 rounded-2xl px-5 py-4 border border-zinc-200 dark:border-zinc-700 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* 输入区域 */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={modelConfig ? "输入消息... (Enter 发送，Shift + Enter 换行)" : "请先配置模型，推荐使用智谱 AI GLM-4-Flash..."}
              rows={1}
              className="w-full px-6 py-4 pr-16 border border-zinc-200 dark:border-zinc-700 rounded-2xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none shadow-sm transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !modelConfig}
              style={{
                minHeight: '60px',
                maxHeight: '200px',
              }}
              onKeyDown={(e) => {
                // 自动调整高度
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 200) + 'px';
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim() || !modelConfig}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 flex items-center justify-center"
              title="发送消息"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-zinc-500 dark:text-zinc-400">
            <p>按 Enter 发送消息，Shift + Enter 换行</p>
            <p className="flex items-center gap-1">
              <Sparkles size={12} />
              {modelConfig ? `${modelConfig.name} (${modelConfig.models[0]})` : '请配置模型'}
            </p>
          </div>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-100 px-6 py-3 rounded-xl shadow-lg border border-red-200 dark:border-red-800 z-50 animate-in slide-in-from-top fade-in duration-300">
          <p className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span className="font-medium">{error}</span>
          </p>
        </div>
      )}

      {/* 模型配置对话框 */}
      <ModelConfig
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
        onConfigChange={handleConfigChange}
        currentConfig={modelConfig || undefined}
      />
    </div>
  );
}
