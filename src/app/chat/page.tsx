'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, Clock, Trash2, Settings, AlertCircle, Download, Image as ImageIcon, ExternalLink, Video as VideoIcon, Square, Volume2, VolumeX } from 'lucide-react';
import ModelConfig, { AIModelConfig } from '@/components/ModelConfig';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  type?: 'text' | 'image' | 'video';
  imageUrl?: string;
  videoUrl?: string;
  timestamp?: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '你好！我是 Peter·Pan 的 AI 助手。我可以帮助你回答问题、提供信息或者只是聊聊天。\n\n💡 你可以通过右上角的「设置」按钮配置自己的大模型，默认由 GLM-4.7-Flash 模型为你提供服务。\n\n🎨 **文生图功能**：选择「CogView-3-Flash」模型，我可以根据你的描述生成图片！\n\n🎬 **文生视频功能**：选择「CogVideoX-Flash」模型，我可以根据你的描述生成视频！生成的视频会包含同步的 AI 音效（语音、音效和背景音乐）。\n\n🔊 **TTS 语音朗读功能**：\n- 点击消息旁的「朗读」按钮，使用浏览器本地语音合成朗读内容\n- 音色取决于您的设备系统（Windows/Mac/Android/iOS）\n- 无需网络，快速响应\n\n📝 **视频时长说明**：目前 CogVideoX-Flash 模型支持的视频时长约为 **6-10 秒**，不支持生成更长的视频。如果你需要更长的视频，建议分段生成或使用其他专业视频工具。\n\n🎵 **音频生成提示**：为了获得更好的音频效果，建议在描述中明确包含声音相关的提示，例如：\n- "一个人说：\'你好！\'"（人类对话）\n- "热闹的街道，汽车喇叭声、行人交谈声"（环境音效）\n- "轻柔的背景音乐，营造温馨氛围"（背景音乐）\n\n⚠️ **注意事项**：\n- 音频生成主要针对人类语音和环境音效，对动物叫声的支持有限\n- 视频时长受模型限制，一般为 6-10 秒',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [modelConfig, setModelConfig] = useState<AIModelConfig | null>(null);
  const [deepThink, setDeepThink] = useState(false);
  const [webSearch, setWebSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const initialMessageCountRef = useRef<number>(1); // 初始有1条欢迎消息
  const abortControllerRef = useRef<AbortController | null>(null); // 用于中断请求

  // TTS 相关状态
  const [playingMessageIndex, setPlayingMessageIndex] = useState<number | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(typeof window !== 'undefined' ? window.speechSynthesis : null);

  // 聊天记录缓存配置
  const CHAT_CACHE_KEY = 'chat_history';
  const CHAT_CACHE_DURATION = 86400000; // 24 小时

  // 从 localStorage 加载聊天记录
  const loadChatHistory = (): Message[] | null => {
    try {
      const cached = localStorage.getItem(CHAT_CACHE_KEY);
      if (!cached) return null;

      const { messages: savedMessages, timestamp } = JSON.parse(cached);
      const now = Date.now();

      // 检查缓存是否过期
      if (now - timestamp > CHAT_CACHE_DURATION) {
        console.log('[Chat] 聊天记录缓存已过期');
        localStorage.removeItem(CHAT_CACHE_KEY);
        return null;
      }

      console.log('[Chat] 加载本地聊天记录，共', savedMessages.length, '条消息');
      // 转换 timestamp 为 Date 对象
      return savedMessages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
    } catch (error) {
      console.error('[Chat] 加载聊天记录失败:', error);
      return null;
    }
  };

  // 保存聊天记录到 localStorage
  const saveChatHistory = (msgs: Message[]) => {
    try {
      // 只保存最近 100 条消息
      const messagesToSave = msgs.slice(-100);
      const cache = {
        messages: messagesToSave,
        timestamp: Date.now(),
      };
      localStorage.setItem(CHAT_CACHE_KEY, JSON.stringify(cache));
      console.log('[Chat] 聊天记录已保存到本地，共', messagesToSave.length, '条消息');
    } catch (error) {
      console.error('[Chat] 保存聊天记录失败:', error);
    }
  };

  // 清除聊天记录缓存
  const clearChatHistoryCache = () => {
    try {
      localStorage.removeItem(CHAT_CACHE_KEY);
      console.log('[Chat] 聊天记录缓存已清除');
    } catch (error) {
      console.error('[Chat] 清除聊天记录缓存失败:', error);
    }
  };

  // 从 localStorage 加载配置
  useEffect(() => {
    try {
      const saved = localStorage.getItem('current-model-config');
      if (saved) {
        setModelConfig(JSON.parse(saved));
      }
    } catch (error) {
      console.error('[Chat] 加载模型配置失败:', error);
    }

    // 加载聊天记录
    const chatHistory = loadChatHistory();
    if (chatHistory && chatHistory.length > 0) {
      setMessages(chatHistory);
      initialMessageCountRef.current = chatHistory.length;
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
    // 保存聊天记录到 localStorage
    saveChatHistory(messages);
  }, [messages]);

  // 停止生成
  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
      console.log('[Chat] 生成已停止');
    }
  };

  // 停止 TTS 播放
  const stopTTS = () => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
      setPlayingMessageIndex(null);
    }
  };

  // 播放 TTS
  const playTTS = (text: string, index: number) => {
    if (!speechSynthesisRef.current) {
      console.error('[TTS] 浏览器不支持语音合成');
      return;
    }

    // 如果正在播放该消息，则停止
    if (playingMessageIndex === index) {
      stopTTS();
      return;
    }

    // 停止当前播放
    stopTTS();

    // 提取纯文本（去除 markdown 标记）
    let plainText = text
      .replace(/#{1,6}\s+/g, '') // 去除标题标记
      .replace(/\*\*/g, '') // 去除粗体标记
      .replace(/\*/g, '') // 去除斜体标记
      .replace(/`/g, '') // 去除代码标记
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 去除链接
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // 去除图片
      .replace(/\n+/g, ' ') // 换行转为空格
      .trim();

    if (!plainText) {
      console.error('[TTS] 没有可播放的文本');
      return;
    }

    // 创建语音合成实例
    const utterance = new SpeechSynthesisUtterance(plainText);

    // 设置语言（中文）
    utterance.lang = 'zh-CN';
    utterance.rate = 1;
    utterance.pitch = 1;

    // 尝试选择中文语音
    const voices = speechSynthesisRef.current.getVoices();
    const chineseVoice = voices.find(voice =>
      voice.lang.includes('zh') && voice.name.includes('Neural')
    );
    if (chineseVoice) {
      utterance.voice = chineseVoice;
    }

    // 播放事件
    utterance.onstart = () => {
      setPlayingMessageIndex(index);
      console.log('[TTS] 开始播放');
    };

    utterance.onend = () => {
      setPlayingMessageIndex(null);
      console.log('[TTS] 播放结束');
    };

    utterance.onerror = (event) => {
      console.error('[TTS] 播放错误:', event.error);
      setPlayingMessageIndex(null);
    };

    // 开始播放
    speechSynthesisRef.current.speak(utterance);
  };

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    // 检查是否配置了模型
    if (!modelConfig) {
      setError('请先配置大模型 API Key');
      setShowConfig(true);
      return;
    }

    // 创建 AbortController 用于中断请求
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    // 停止 TTS 播放
    stopTTS();

    try {
      const provider = modelConfig.provider;
      const modelName = modelConfig.models[0];

      // 构建请求消息
      const apiMessages = messages
        .slice(initialMessageCountRef.current)
        .map((msg) => ({
          role: msg.role === 'system' ? 'system' : msg.role,
          content: msg.content,
        }));

      apiMessages.push({ role: 'user', content: input });

      let response: Response;

      // 判断是智谱 AI 还是其他模型
      if (provider === 'zhipu') {
        // 智谱 AI
        const zhipuRequestBody = {
          model: modelName,
          messages: apiMessages,
          stream: true,
        };

        // 检查是否有自定义 API Key
        const apiKey = modelConfig.apiKey || process.env.NEXT_PUBLIC_ZHIPU_API_KEY;

        if (!apiKey) {
          throw new Error('未配置 API Key');
        }

        response = await fetch(modelConfig.baseUrl + '/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(zhipuRequestBody),
          signal: abortController.signal,
        });
      } else {
        // OpenAI 兼容格式
        const requestBody = {
          model: modelName,
          messages: apiMessages,
          stream: true,
        };

        response = await fetch(modelConfig.baseUrl + '/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${modelConfig.apiKey}`,
          },
          body: JSON.stringify(requestBody),
          signal: abortController.signal,
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }

      // 处理流式响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('无法读取响应流');
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              break;
            }

            try {
              const json = JSON.parse(data);
              const content = json.choices?.[0]?.delta?.content || '';

              if (content) {
                setMessages((prev) => {
                  const updated = [...prev];
                  const lastMessage = updated[updated.length - 1];
                  if (lastMessage && lastMessage.role === 'assistant') {
                    lastMessage.content += content;
                  }
                  return updated;
                });
              }
            } catch (e) {
              // 忽略 JSON 解析错误
            }
          }
        }
      }

      console.log('[Chat] 消息发送成功');
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('[Chat] 请求被中断');
      } else {
        console.error('[Chat] 发送消息失败:', error);
        setError(error instanceof Error ? error.message : '发送消息失败');
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  // 配置变化处理
  const handleConfigChange = (config: AIModelConfig) => {
    setModelConfig(config);
  };

  // 清空聊天
  const clearChat = () => {
    if (window.confirm('确定要清空聊天记录吗？')) {
      setMessages([]);
      clearChatHistoryCache();
      initialMessageCountRef.current = 0;
      stopTTS();
    }
  };

  // 下载图片
  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('[Chat] 下载图片失败:', error);
      alert('下载失败');
    }
  };

  // 下载视频
  const downloadVideo = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('[Chat] 下载视频失败:', error);
      alert('下载失败');
    }
  };

  // 格式化时间
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 获取提供商图标
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
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      {/* 顶部导航栏 */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Peter·Pan AI 助手
                </h1>
                <div className="flex items-center gap-2 text-xs">
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
        <div className="max-w-5xl mx-auto px-4 py-8">
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
                  className={`w-full max-w-full rounded-2xl shadow-sm ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-sky-50 to-sky-100 text-sky-950 shadow-sky-100/20 px-5 py-4'
                      : 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  {/* 用户消息标题栏 */}
                  {message.role === 'user' && (
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-sky-200 dark:border-sky-700">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-sky-600" />
                        <span className="text-xs font-medium text-sky-800 dark:text-sky-400">你</span>
                      </div>
                      {message.content && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => playTTS(message.content, index)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              playingMessageIndex === index
                                ? 'bg-sky-600 text-white'
                                : 'bg-white dark:bg-sky-200/50 text-sky-700 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-200/50'
                            }`}
                            title={playingMessageIndex === index ? '停止播放' : '播放语音'}
                          >
                            {playingMessageIndex === index ? (
                              <>
                                <VolumeX size={14} />
                                <span>停止</span>
                              </>
                            ) : (
                              <>
                                <Volume2 size={14} />
                                <span>朗读</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 助手消息标题栏 */}
                  {message.role === 'assistant' && (
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-zinc-200 dark:border-zinc-700">
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">AI 助手</span>
                      </div>
                      {message.content && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => playTTS(message.content, index)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              playingMessageIndex === index
                                ? 'bg-blue-600 text-white'
                                : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-600'
                            }`}
                            title={playingMessageIndex === index ? '停止播放' : '播放语音'}
                          >
                            {playingMessageIndex === index ? (
                              <>
                                <VolumeX size={14} />
                                <span>停止</span>
                              </>
                            ) : (
                              <>
                                <Volume2 size={14} />
                                <span>朗读</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="leading-relaxed text-sm sm:text-base text-zinc-900 dark:text-zinc-100 max-w-none">
                    {message.role === 'assistant' && message.type === 'video' && message.videoUrl ? (
                      <div className="space-y-4">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                            strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                        <div className="mt-4">
                          <video
                            controls
                            className="w-full rounded-lg shadow-lg"
                            src={message.videoUrl}
                          />
                          <div className="flex items-center gap-2 mt-3">
                            <button
                              onClick={() => message.videoUrl && window.open(message.videoUrl, '_blank')}
                              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={!message.videoUrl}
                            >
                              <ExternalLink size={16} />
                              <span>在新标签页打开</span>
                            </button>
                            <button
                              onClick={() => message.videoUrl && downloadVideo(message.videoUrl, `generated-video-${Date.now()}.mp4`)}
                              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={!message.videoUrl}
                            >
                              <Download size={16} />
                              <span>下载视频</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : message.role === 'assistant' && message.type === 'image' && message.imageUrl ? (
                      <div className="space-y-4">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                            strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                        <div className="mt-4">
                          <img
                            src={message.imageUrl}
                            alt="Generated image"
                            className="w-full rounded-lg shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => message.imageUrl && window.open(message.imageUrl, '_blank')}
                          />
                          <div className="flex items-center gap-2 mt-3">
                            <button
                              onClick={() => message.imageUrl && window.open(message.imageUrl, '_blank')}
                              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={!message.imageUrl}
                            >
                              <ExternalLink size={16} />
                              <span>在新标签页打开</span>
                            </button>
                            <button
                              onClick={() => message.imageUrl && downloadImage(message.imageUrl, `generated-image-${Date.now()}.png`)}
                              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={!message.imageUrl}
                            >
                              <Download size={16} />
                              <span>下载图片</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : message.role === 'assistant' ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          // 自定义样式
                          p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                          h1: ({ children }) => <h1 className="text-xl font-bold mb-3">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-lg font-bold mb-2">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-base font-bold mb-2">{children}</h3>,
                          ul: ({ children }) => <ul className="list-disc list-inside mb-3">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal list-inside mb-3">{children}</ol>,
                          li: ({ children }) => <li className="mb-1">{children}</li>,
                          code: ({ className, children, ...props }: any) => {
                            const isInline = !className;
                            return isInline ? (
                              <code className="bg-zinc-100 dark:bg-zinc-700 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                                {children}
                              </code>
                            ) : (
                              <code className="block bg-zinc-100 dark:bg-zinc-700 px-3 py-2 rounded-lg text-xs font-mono overflow-x-auto" {...props}>
                                {children}
                              </code>
                            );
                          },
                          pre: ({ children }) => <pre className="bg-zinc-100 dark:bg-zinc-700 p-3 rounded-lg overflow-x-auto mb-3">{children}</pre>,
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-zinc-300 dark:border-zinc-600 pl-3 italic mb-3">
                              {children}
                            </blockquote>
                          ),
                          a: ({ href, children }) => (
                            <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 underline">
                              {children}
                            </a>
                          ),
                          strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                          em: ({ children }) => <em className="italic">{children}</em>,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                  {message.timestamp && (
                    <div
                      className={`flex items-center gap-1 mt-2 text-xs ${
                        message.role === 'user'
                          ? 'text-sky-800'
                          : 'text-zinc-400 dark:text-zinc-500'
                      }`}
                    >
                      <Clock size={12} />
                      <span>{formatTime(message.timestamp)}</span>
                    </div>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center shadow-lg">
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
      <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="输入消息，按 Enter 发送，Shift + Enter 换行..."
              className="flex-1 resize-none rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-zinc-100 min-h-[48px] max-h-[200px]"
              rows={1}
            />
            {loading ? (
              <button
                onClick={stopGeneration}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all flex items-center gap-2"
              >
                <Square size={16} />
                <span>停止</span>
              </button>
            ) : (
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} />
                <span className="hidden sm:inline">发送</span>
              </button>
            )}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 text-center">
            由 GLM-4.7-Flash 模型提供服务 · 支持深度思考与联网搜索
          </p>
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
