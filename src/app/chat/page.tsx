'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, Clock, Trash2, Settings, AlertCircle, Download, Image as ImageIcon, ExternalLink, Video as VideoIcon, Square, Volume2, VolumeX, Headphones } from 'lucide-react';
import ModelConfig, { AIModelConfig } from '@/components/ModelConfig';
import TTSSettings, { TTSSettings as TTSConfig } from '@/components/TTSSettings';
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
      content: '你好！我是 Peter·Pan 的 AI 助手。我可以帮助你回答问题、提供信息或者只是聊聊天。\n\n💡 你可以通过右上角的「设置」按钮配置自己的大模型，默认由 GLM-4.7-Flash 模型为你提供服务。\n\n🎨 **文生图功能**：选择「CogView-3-Flash」模型，我可以根据你的描述生成图片！\n\n🎬 **文生视频功能**：选择「CogVideoX-Flash」模型，我可以根据你的描述生成视频！生成的视频会包含同步的 AI 音效（语音、音效和背景音乐）。\n\n🔊 **TTS 语音功能**：\n- 每条消息都支持朗读和下载音频功能\n- 输入 `TTS>>` 开头的内容，我会直接生成音频并下载，无需调用大模型\n  例如：`TTS>> 你好，这是一段语音测试`\n\n📝 **视频时长说明**：目前 CogVideoX-Flash 模型支持的视频时长约为 **6-10 秒**，不支持生成更长的视频。如果你需要更长的视频，建议分段生成或使用其他专业视频工具。\n\n🎵 **音频生成提示**：为了获得更好的音频效果，建议在描述中明确包含声音相关的提示，例如：\n- "一个人说：\'你好！\'"（人类对话）\n- "热闹的街道，汽车喇叭声、行人交谈声"（环境音效）\n- "轻柔的背景音乐，营造温馨氛围"（背景音乐）\n\n⚠️ **注意事项**：\n- 音频生成主要针对人类语音和环境音效，对动物叫声的支持有限\n- 视频时长受模型限制，一般为 6-10 秒',
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
  const [showTTSSettings, setShowTTSSettings] = useState(false);
  const [ttsSettings, setTtsSettings] = useState<TTSConfig | null>(null);
  const [downloadingMessageIndex, setDownloadingMessageIndex] = useState<number | null>(null);

  // 检查消息是否有 TTS 前缀，并返回处理后的内容和标志
  const checkTTSPrefix = (content: string) => {
    const hasTTSPrefix = content.trim().startsWith('TTS:');
    const hasTTSMarker = content.trim().startsWith('TTS>>');
    const displayContent = hasTTSPrefix
      ? content.substring(4).trim()
      : hasTTSMarker
      ? content.substring(5).trim()
      : content;
    return { hasTTSPrefix, hasTTSMarker, displayContent };
  };

  // 从 localStorage 加载 TTS 设置
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tts-settings');
      if (saved) {
        setTtsSettings(JSON.parse(saved));
      } else {
        // 默认设置
        setTtsSettings({
          enabled: true,
          volume: 1.0,
          rate: 1.0,
          pitch: 1.0,
          voiceURI: '',
          lang: 'zh-CN',
        });
      }
    } catch (error) {
      console.error('[Chat] 加载 TTS 设置失败:', error);
    }
  }, []);

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
    const saved = localStorage.getItem('current-model-config');
    if (saved) {
      const config = JSON.parse(saved);
      // 如果旧配置是 glm-4-flash，自动升级到 glm-4.7-flash
      if (config.models && config.models[0] === 'glm-4-flash') {
        config.models[0] = 'glm-4.7-flash';
        localStorage.setItem('current-model-config', JSON.stringify(config));
      }
      setModelConfig(config);
    } else {
      // 设置默认配置：智谱 AI GLM-4.7-Flash（使用环境变量）
      setModelConfig({
        name: '智谱 AI',
        provider: 'zhipu',
        apiKey: '', // API KEY 将从后端环境变量读取
        baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
        models: ['glm-4.7-flash'],
        enabled: true,
      });
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

    // 检查是否启用 TTS
    if (!ttsSettings?.enabled) {
      console.log('[TTS] TTS 功能已禁用');
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

    // 如果有 TTS: 或 TTS>> 前缀，移除它
    if (plainText.startsWith('TTS:')) {
      plainText = plainText.substring(4).trim();
    } else if (plainText.startsWith('TTS>>')) {
      plainText = plainText.substring(5).trim();
    }

    if (!plainText) {
      console.error('[TTS] 没有可播放的文本');
      return;
    }

    // 创建语音合成实例
    const utterance = new SpeechSynthesisUtterance(plainText);

    // 应用 TTS 设置
    utterance.lang = ttsSettings.lang || 'zh-CN';
    utterance.rate = ttsSettings.rate || 1;
    utterance.pitch = ttsSettings.pitch || 1;
    utterance.volume = ttsSettings.volume || 1;

    // 选择指定的语音
    if (ttsSettings.voiceURI) {
      const voices = speechSynthesisRef.current.getVoices();
      const selectedVoice = voices.find(voice => voice.voiceURI === ttsSettings.voiceURI);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
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

  // 下载音频
  const downloadAudio = async (text: string, index: number) => {
    if (downloadingMessageIndex === index) {
      return; // 已经在下载中
    }

    setDownloadingMessageIndex(index);

    try {
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

      // 如果有 TTS: 或 TTS>> 前缀，移除它
      if (plainText.startsWith('TTS:')) {
        plainText = plainText.substring(4).trim();
      } else if (plainText.startsWith('TTS>>')) {
        plainText = plainText.substring(5).trim();
      }

      if (!plainText) {
        alert('没有可转换的文本内容');
        return;
      }

      console.log('[TTS] 生成音频:', plainText);

      // 调用后端 TTS API
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: plainText,
          speaker: ttsSettings?.voiceURI ? undefined : 'zh_female_xiaohe_uranus_bigtts',
          audioFormat: 'mp3',
          sampleRate: 24000,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '音频生成失败');
      }

      const data = await response.json();

      // 下载音频文件
      const audioResponse = await fetch(data.audioUri);
      const blob = await audioResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tts-audio-${Date.now()}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('[TTS] 音频下载成功');
    } catch (error) {
      console.error('[TTS] 下载音频失败:', error);
      alert(error instanceof Error ? error.message : '下载音频失败');
    } finally {
      setDownloadingMessageIndex(null);
    }
  };

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    // 检查是否有 TTS>> 前缀，如果有则直接生成音频
    if (input.trim().startsWith('TTS>>')) {
      const ttsContent = input.substring(5).trim();
      if (!ttsContent) {
        setError('请在 TTS>> 后输入要转换的文本');
        return;
      }

      // 添加用户消息
      const userMessage: Message = {
        role: 'user',
        content: input,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setInput('');

      // 直接调用 TTS API 并下载
      try {
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: ttsContent,
            speaker: 'zh_female_xiaohe_uranus_bigtts',
            audioFormat: 'mp3',
            sampleRate: 24000,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || '音频生成失败');
        }

        const data = await response.json();

        // 下载音频文件
        const audioResponse = await fetch(data.audioUri);
        const blob = await audioResponse.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `tts-audio-${Date.now()}.mp3`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        console.log('[TTS] 音频生成并下载成功');
      } catch (error) {
        console.error('[TTS] 音频生成失败:', error);

        // 使用 setError 显示错误提示（顶部错误提示）
        setError(error instanceof Error ? error.message : '音频生成失败');

        // 3秒后自动清除错误
        setTimeout(() => setError(null), 3000);
      }
      return;
    }

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

    // 添加用户消息
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      // 创建一个空的助手消息，用于更新
      const assistantMessage: Message = {
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };
      const assistantIndex = messages.length + 1;
      setMessages((prev) => [...prev, assistantMessage]);

      // 检测模型类型
      const imageModels = ['cogview-3-flash', 'CogView-3-Flash', 'cogview', 'CogView', 'cogview-3', 'CogView-3'];
      const videoModels = ['cogvideox-flash', 'CogVideoX-Flash', 'cogvideox', 'CogVideoX', 'cogvideo', 'CogVideo'];
      const isImageModel = imageModels.some(imgModel => modelConfig.models[0].toLowerCase().includes(imgModel.toLowerCase()));
      const isVideoModel = videoModels.some(vidModel => modelConfig.models[0].toLowerCase().includes(vidModel.toLowerCase()));

      if (isVideoModel) {
        // 文生视频模式
        const response = await fetch('/api/chat/video', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: abortController.signal, // 添加 abort signal
          body: JSON.stringify({
            prompt: userMessage.content,
            model: modelConfig.models[0],
            apiKey: modelConfig.apiKey,
            baseUrl: modelConfig.baseUrl,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `请求失败: ${response.status}`);
        }

        const data = await response.json();

        // 更新消息为视频类型
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMessage = newMessages[assistantIndex];
          if (lastMessage) {
            lastMessage.type = 'video';
            lastMessage.videoUrl = data.videoUrl;
            lastMessage.content = `✅ 已为您生成视频！\n\n**描述**：${data.prompt}`;
          }
          return newMessages;
        });
      } else if (isImageModel) {
        // 文生图模式
        const response = await fetch('/api/chat/image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: abortController.signal, // 添加 abort signal
          body: JSON.stringify({
            prompt: userMessage.content,
            model: modelConfig.models[0],
            apiKey: modelConfig.apiKey,
            baseUrl: modelConfig.baseUrl,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `请求失败: ${response.status}`);
        }

        const data = await response.json();

        // 更新消息为图片类型
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMessage = newMessages[assistantIndex];
          if (lastMessage) {
            lastMessage.type = 'image';
            lastMessage.imageUrl = data.imageUrl;
            lastMessage.content = `✅ 已为您生成图片！\n\n**描述**：${data.prompt}`;
          }
          return newMessages;
        });
      } else {
        // 文本聊天模式：使用流式 API
        const response = await fetch('/api/chat/stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: abortController.signal, // 添加 abort signal
          body: JSON.stringify({
            message: userMessage.content,
            model: modelConfig.models[0],
            provider: modelConfig.provider,
            apiKey: modelConfig.apiKey,
            baseUrl: modelConfig.baseUrl,
            deepThink,
            webSearch,
          }),
        });

        if (!response.ok) {
          throw new Error(`请求失败: ${response.status}`);
        }

        // 处理流式响应
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error('无法获取响应流');
        }

        let buffer = '';
        let content = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);

                if (parsed.type === 'content') {
                  content += parsed.content;
                  // 实时更新消息内容
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[assistantIndex];
                    if (lastMessage) {
                      lastMessage.content = content;
                    }
                    return newMessages;
                  });
                } else if (parsed.type === 'error') {
                  throw new Error(parsed.error);
                }
              } catch (e) {
                console.error('解析流数据失败:', e);
              }
            }
          }
        }
      }
    } catch (err) {
      // 如果是用户主动中断请求，不显示错误
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('[Chat] 请求已中断');
        return;
      }

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
      abortControllerRef.current = null; // 清理 abort controller
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
    // 清除聊天记录缓存
    clearChatHistoryCache();
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

  // 下载图片（处理跨域）
  const downloadImage = async (imageUrl: string, filename: string = 'generated-image.png') => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('下载图片失败:', error);
      // 降级方案：直接在新标签页打开
      window.open(imageUrl, '_blank');
    }
  };

  const downloadVideo = async (videoUrl: string, filename: string = 'generated-video.mp4') => {
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('下载视频失败:', error);
      // 降级方案：直接在新标签页打开
      window.open(videoUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-blue-50/30 to-purple-50/30 dark:from-zinc-950 dark:via-blue-950/20 dark:to-purple-950/20">
      {/* 顶部导航 */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
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
                onClick={() => setShowTTSSettings(true)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  ttsSettings?.enabled
                    ? 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/20'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/20'
                }`}
                title="语音朗读设置"
              >
                <Headphones size={16} />
                <span className="hidden sm:inline">语音</span>
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
                          <button
                            onClick={() => downloadAudio(message.content, index)}
                            disabled={downloadingMessageIndex === index}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              downloadingMessageIndex === index
                                ? 'bg-green-600 text-white cursor-wait'
                                : 'bg-white dark:bg-sky-200/50 text-sky-700 dark:text-sky-400 hover:bg-green-100 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400'
                            }`}
                            title="下载 TTS 音频"
                          >
                            {downloadingMessageIndex === index ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>生成音频中</span>
                              </>
                            ) : (
                              <>
                                <Download size={14} />
                                <span>TTS音频</span>
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
                          <button
                            onClick={() => downloadAudio(message.content, index)}
                            disabled={downloadingMessageIndex === index}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              downloadingMessageIndex === index
                                ? 'bg-green-600 text-white cursor-wait'
                                : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-green-100 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400'
                            }`}
                            title="下载 TTS 音频"
                          >
                            {downloadingMessageIndex === index ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>生成音频中</span>
                              </>
                            ) : (
                              <>
                                <Download size={14} />
                                <span>TTS音频</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="leading-relaxed text-sm sm:text-base text-zinc-900 dark:text-zinc-100 max-w-none">
                    {(() => {
                      const { hasTTSPrefix, hasTTSMarker, displayContent } = checkTTSPrefix(message.content);

                      if (message.role === 'assistant' && message.type === 'video' && message.videoUrl) {
                        return (
                          <div className="space-y-4">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                                strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                              }}
                            >
                              {displayContent}
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
                        );
                      }

                      if (message.role === 'assistant' && message.type === 'image' && message.imageUrl) {
                        return (
                          <div className="space-y-4">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                                strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                              }}
                            >
                              {displayContent}
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
                        );
                      }

                      if (message.role === 'assistant') {
                        return (
                          <>
                            {(hasTTSPrefix || hasTTSMarker) && (
                              <div className="mb-3 p-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                                <p className="text-xs text-purple-700 dark:text-purple-300 flex items-center gap-1">
                                  <Volume2 size={12} />
                                  此消息包含 TTS 标识，已为您准备好语音下载
                                </p>
                              </div>
                            )}
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
                              {displayContent}
                            </ReactMarkdown>
                          </>
                        );
                      }

                      return <p className="whitespace-pre-wrap">{message.content}</p>;
                    })()}
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
      <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-6">
          {/* 整体输入框容器 */}
          <div className="relative border border-zinc-200 dark:border-zinc-700 rounded-2xl bg-white dark:bg-zinc-800 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
            {/* 输入框 */}
            <textarea
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="输入消息，按 Enter 发送消息，Shift + Enter 换行"
              rows={1}
              className="w-full px-6 py-4 pb-16 border-0 bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none resize-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !modelConfig}
              style={{
                minHeight: '120px',
                maxHeight: '300px',
              }}
              onKeyDown={(e) => {
                // 自动调整高度
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 300) + 'px';
              }}
            />

            {/* 底部按钮栏 */}
            <div className="absolute bottom-0 left-0 right-0 px-4 py-3 flex items-center justify-between">
              {/* 左侧功能按钮 */}
              <div className="flex items-center gap-2">
                {/* 深度思考按钮 */}
                <button
                  onClick={() => setDeepThink(!deepThink)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    deepThink
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-600'
                  }`}
                  title="启用深度思考，AI 会展示详细的推理过程"
                >
                  <Sparkles size={16} />
                  <span className="hidden sm:inline">深度思考</span>
                </button>

                {/* 联网搜索按钮 */}
                <button
                  onClick={() => setWebSearch(!webSearch)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    webSearch
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-600'
                  }`}
                  title="启用联网搜索，AI 会先搜索最新信息"
                >
                  <AlertCircle size={16} />
                  <span className="hidden sm:inline">联网搜索</span>
                </button>
              </div>

              {/* 右侧发送/停止按钮 */}
              {loading ? (
                <button
                  onClick={stopGeneration}
                  className="w-10 h-10 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl font-medium transition-all shadow-md shadow-red-600/20 hover:shadow-lg hover:shadow-red-600/30 flex items-center justify-center"
                  title="停止生成"
                >
                  <Square className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || !modelConfig}
                  className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 flex items-center justify-center"
                  title="发送消息"
                >
                  <Send className="w-5 h-5" />
                </button>
              )}
            </div>
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

      {/* TTS 设置对话框 */}
      <TTSSettings
        isOpen={showTTSSettings}
        onClose={() => setShowTTSSettings(false)}
        onSettingsChange={(settings) => setTtsSettings(settings)}
        currentSettings={ttsSettings || undefined}
      />
    </div>
  );
}
