'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, Clock, Trash2, Settings, AlertCircle, Download, Image as ImageIcon, ExternalLink, Video as VideoIcon, Square, Volume2, VolumeX, DownloadCloud, Headphones } from 'lucide-react';
import ModelConfig, { AIModelConfig } from '@/components/ModelConfig';
import TTSSettings, { TTSSettings as TTSSettingsType } from '@/components/TTSSettings';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  reasoningContent?: string; // 思考过程（用于 glm-4.7-flash 等支持推理的模型）
  type?: 'text' | 'image' | 'video';
  imageUrl?: string;
  videoUrl?: string;
  timestamp?: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '你好！我是 Peter·Pan 的 AI 助手。我可以帮助你回答问题、提供信息或者只是聊聊天。\n\n💡 你可以通过右上角的「设置」按钮配置自己的大模型，默认由 glm-4.7-flash 模型为你提供服务。\n\n🎨 **文生图功能**：选择「CogView-3-Flash」模型，我可以根据你的描述生成图片！\n\n🎬 **文生视频功能**：选择「CogVideoX-Flash」模型，我可以根据你的描述生成视频！生成的视频会包含同步的 AI 音效（语音、音效和背景音乐）。\n\n🔊 **TTS 语音朗读功能**：\n- 点击消息旁的「朗读」按钮，使用浏览器本地语音合成朗读内容\n- 点击右上角的「语音」按钮，可以为不同语言配置专属音色\n- 系统会根据消息内容自动检测语言，并使用对应语言的音色\n- 点击「下载」按钮可以导出音频（需要使用系统录音工具辅助）\n- ℹ️ 不同设备支持的音色不同，桌面端（如 Edge 浏览器）提供「Xiaoxiao Online」等高质量云端音色，手机端则使用系统内置音色（如「婷婷」），系统会自动选择可用音色\n\n📝 **视频时长说明**：目前 CogVideoX-Flash 模型支持的视频时长约为 **6-10 秒**，不支持生成更长的视频。如果你需要更长的视频，建议分段生成或使用其他专业视频工具。\n\n🎵 **音频生成提示**：为了获得更好的音频效果，建议在描述中明确包含声音相关的提示，例如：\n- "一个人说：\'你好！\'"（人类对话）\n- "热闹的街道，汽车喇叭声、行人交谈声"（环境音效）\n- "轻柔的背景音乐，营造温馨氛围"（背景音乐）\n\n⚠️ **注意事项**：\n- 音频生成主要针对人类语音和环境音效，对动物叫声的支持有限\n- 视频时长受模型限制，一般为 6-10 秒',
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
  const [downloadingMessageIndex, setDownloadingMessageIndex] = useState<number | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(typeof window !== 'undefined' ? window.speechSynthesis : null);
  const [showTTSSettings, setShowTTSSettings] = useState(false);
  const [ttsSettings, setTTSSettings] = useState<TTSSettingsType | undefined>();
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  // 初始化语音列表
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          console.log('[TTS] 语音列表加载完成，共', voices.length, '个语音');
          setVoicesLoaded(true);
        }
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        loadVoices();
      };
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

    // 加载 TTS 设置
    try {
      const saved = localStorage.getItem('tts-voice-settings');
      if (saved) {
        setTTSSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error('[Chat] 加载 TTS 设置失败:', error);
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

  // 检测文本语言
  const detectLanguage = (text: string): string => {
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishChars = (text.match(/[a-zA-Z]/g) || []).length;
    const totalChars = text.length;

    if (totalChars === 0) return 'zh';

    // 如果中文字符占比超过 30%，判定为中文
    if (chineseChars / totalChars > 0.3) return 'zh';
    // 如果英文字符占比超过 60%，判定为英文
    if (englishChars / totalChars > 0.6) return 'en';

    return 'zh'; // 默认中文
  };

  // 选择默认音色
  const selectDefaultVoice = (lang: string, voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
    if (!voices.length) {
      console.warn('[TTS] 没有可用的语音');
      return null;
    }

    // 筛选该语言的语音
    const langVoices = voices.filter(voice => voice.lang.startsWith(lang));

    if (!langVoices.length) {
      console.warn('[TTS] 没有找到该语言的语音，使用第一个语音');
      return voices[0] || null;
    }

    // 中文优先选择高质量音色
    if (lang === 'zh') {
      console.log('[TTS] 中文语音列表:', langVoices.map(v => v.name).join(', '));

      // 1. 优先匹配 Online 语音（桌面端高质量）
      const onlineVoiceNames = [
        'xiaoxiao online', 'yaoyao online', 'yunyang online', 'yunxi online'
      ];
      for (const name of onlineVoiceNames) {
        const voice = langVoices.find(v =>
          v.name.toLowerCase().includes(name)
        );
        if (voice) {
          console.log('[TTS] 找到 Online 语音:', voice.name);
          return voice;
        }
      }

      // 2. 匹配 Neural 语音
      const neuralVoiceNames = [
        'xiaoxiaoneural', 'yaoyaoneural', 'yunyangneural', 'yunxineural',
        'xiaoyineural', 'jianhaoneural', 'xiaochenneural', 'xiaomengneural'
      ];
      for (const name of neuralVoiceNames) {
        const voice = langVoices.find(v =>
          v.name.toLowerCase().includes(name)
        );
        if (voice) {
          console.log('[TTS] 找到 Neural 语音:', voice.name);
          return voice;
        }
      }

      // 3. 匹配常见中文名称（手机端）
      const mobileVoiceNames = [
        '婷婷', '晓晓', '姚姚', '云扬', '云希', '晓伊', '建豪', '晓辰', '晓梦',
        'xiao xiao', 'yao yao', 'yun yang', 'yun xi'
      ];
      for (const name of mobileVoiceNames) {
        const voice = langVoices.find(v =>
          v.name.toLowerCase().includes(name.toLowerCase())
        );
        if (voice) {
          console.log('[TTS] 找到常见中文语音:', voice.name);
          return voice;
        }
      }

      // 4. 按地区优先级选择：中国大陆 > 香港 > 台湾 > 其他
      const getRegionPriority = (lang: string) => {
        const region = lang.split('-')[1]?.toUpperCase();
        switch (region) {
          case 'CN': return 1;
          case 'HK': return 2;
          case 'TW': return 3;
          default: return 4;
        }
      };

      const sortedVoices = [...langVoices].sort((a, b) => {
        const priorityA = getRegionPriority(a.lang);
        const priorityB = getRegionPriority(b.lang);

        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }

        return a.name.localeCompare(b.name);
      });

      console.log('[TTS] 按优先级选择语音:', sortedVoices[0].name);
      return sortedVoices[0] || null;
    }

    // 其他语言优先选择 Neural
    const neuralVoice = langVoices.find(voice =>
      voice.name.toLowerCase().includes('neural')
    );

    if (neuralVoice) {
      console.log('[TTS] 找到 Neural 语音:', neuralVoice.name);
      return neuralVoice;
    }

    // 使用第一个该语言的语音
    console.log('[TTS] 使用第一个该语言的语音:', langVoices[0].name);
    return langVoices[0] || null;
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

    // 停止当前播放并清理队列
    stopTTS();
    speechSynthesisRef.current.cancel();

    // 提取纯文本（去除 markdown 标记）
    let plainText = text
      .replace(/#{1,6}\s+/g, '') // 去除标题标记
      .replace(/\*\*/g, '') // 去除粗体标记
      .replace(/\*/g, '') // 去除斜体标记
      .replace(/`/g, '') // 去除代码标记
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 去除链接
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // 去除图片
      .replace(/TTS>>/g, '') // 去除 TTS 前缀
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // 去除 emoji（包括各种辅助字符）
      .replace(/[\u{2600}-\u{26FF}]/gu, '') // 去除更多符号和图标
      .replace(/[\u{2700}-\u{27BF}]/gu, '') // 去除 Dingbats 符号
      .replace(/\n+/g, ' ') // 换行转为空格
      .trim();

    if (!plainText) {
      console.error('[TTS] 没有可播放的文本');
      return;
    }

    // 创建语音合成实例
    const utterance = new SpeechSynthesisUtterance(plainText);

    // 检测文本语言
    const detectedLang = detectLanguage(plainText);
    console.log('[TTS] 检测到语言:', detectedLang);

    // 设置语言
    utterance.lang = detectedLang === 'zh' ? 'zh-CN' : detectedLang;
    utterance.rate = 1;
    utterance.pitch = 1;

    // 获取当前可用语音
    const voices = speechSynthesisRef.current.getVoices();
    console.log('[TTS] 可用语音数量:', voices.length);
    console.log('[TTS] 可用语音列表:', voices.map(v => `${v.name} (${v.lang})`).join(', '));

    // 根据检测的语言选择音色
    let selectedVoice: SpeechSynthesisVoice | null = null;

    if (ttsSettings?.voices && ttsSettings.voices.length > 0) {
      // 查找用户为该语言配置的音色
      const voiceSetting = ttsSettings.voices.find(v => v.lang === detectedLang);
      if (voiceSetting) {
        console.log('[TTS] 查找用户配置的音色 URI:', voiceSetting.voiceURI);
        selectedVoice = voices.find(v => v.voiceURI === voiceSetting.voiceURI) || null;
        if (selectedVoice) {
          console.log('[TTS] ✓ 使用用户配置的音色:', selectedVoice.name, selectedVoice.lang);
        } else {
          console.warn('[TTS] ✗ 找不到用户配置的音色，尝试使用默认音色');
        }
      }
    }

    // 如果没有找到用户配置的音色，使用默认音色
    if (!selectedVoice) {
      console.log('[TTS] 使用默认音色');
      selectedVoice = selectDefaultVoice(detectedLang, voices);
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
      console.log('[TTS] ✓ 最终选择的音色:', selectedVoice.name, selectedVoice.lang, 'URI:', selectedVoice.voiceURI);
    } else {
      console.warn('[TTS] ✗ 无法选择音色，将使用系统默认');
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
      console.error('[TTS] 播放错误:', event.error, '详情:', event);
      console.error('[TTS] 当前音色:', utterance.voice?.name, utterance.voice?.lang);
      console.error('[TTS] 文本长度:', plainText.length);
      console.error('[TTS] 语言设置:', utterance.lang);

      setPlayingMessageIndex(null);

      // 如果是因为音色问题导致失败，清除该语言的配置
      if (event.error === 'synthesis-failed' && selectedVoice) {
        console.warn('[TTS] 检测到 synthesis-failed 错误，清除缓存配置');
        const newSettings = ttsSettings?.voices.filter(v => v.lang !== detectedLang) || [];
        setTTSSettings({ voices: newSettings });
        localStorage.removeItem('tts-voice-settings');
      }
    };

    // 开始播放
    try {
      speechSynthesisRef.current.speak(utterance);
      console.log('[TTS] 已发送播放请求');
    } catch (error) {
      console.error('[TTS] 播放请求失败:', error);
      setPlayingMessageIndex(null);
    }
  };

  // 下载 TTS 音频（使用 MediaRecorder）
  const handleDownloadTTS = async (text: string, index: number) => {
    if (downloadingMessageIndex === index) return;

    setDownloadingMessageIndex(index);

    // 提取纯文本
    let plainText = text
      .replace(/#{1,6}\s+/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/`/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
      .replace(/TTS>>/g, '') // 去除 TTS 前缀
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // 去除 emoji（包括各种辅助字符）
      .replace(/[\u{2600}-\u{26FF}]/gu, '') // 去除更多符号和图标
      .replace(/[\u{2700}-\u{27BF}]/gu, '') // 去除 Dingbats 符号
      .replace(/\n+/g, ' ')
      .trim();

    if (!plainText) {
      setDownloadingMessageIndex(null);
      return;
    }

    // 检测语言
    const detectedLang = detectLanguage(plainText);

    try {
      // 创建 AudioContext
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();

      // 获取用户选择的音色
      let voiceURI = '';
      if (ttsSettings?.voices) {
        const voiceSetting = ttsSettings.voices.find(v => v.lang === detectedLang);
        if (voiceSetting) {
          voiceURI = voiceSetting.voiceURI;
        }
      }

      // 使用 Web Speech API 生成语音
      const utterance = new SpeechSynthesisUtterance(plainText);
      utterance.lang = detectedLang === 'zh' ? 'zh-CN' : detectedLang;
      utterance.rate = 1;
      utterance.pitch = 1;

      const voices = window.speechSynthesis.getVoices();
      if (voiceURI) {
        const selectedVoice = voices.find(v => v.voiceURI === voiceURI);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
          utterance.lang = selectedVoice.lang;
        }
      } else {
        const defaultVoice = voices.find(voice =>
          voice.lang.startsWith(detectedLang) && voice.name.includes('Neural')
        );
        if (defaultVoice) {
          utterance.voice = defaultVoice;
        }
      }

      // 注意：由于浏览器限制，SpeechSynthesis 无法直接与 Web Audio API 连接
      // 这里使用一个变通方案：使用 MediaRecorder 录制系统音频输出
      // 但这需要用户授权并且需要特殊设置

      alert(
        '⚠️ 音频下载功能说明\n\n' +
        '由于浏览器安全限制，无法直接录制 TTS 语音合成输出。\n\n' +
        '变通方案：\n' +
        '1. 点击「朗读」按钮播放语音\n' +
        '2. 使用系统录音工具（如 Windows 录音机、Mac QuickTime）录制\n' +
        '3. 或者使用第三方 TTS 服务（需要后端支持）\n\n' +
        '抱歉给您带来不便！'
      );

      setDownloadingMessageIndex(null);
    } catch (error) {
      console.error('[TTS] 下载失败:', error);
      alert('音频下载失败，请重试');
      setDownloadingMessageIndex(null);
    }
  };

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    // 检查是否是 TTS>> 指令
    if (input.trim().startsWith('TTS>>')) {
      console.log('[TTS] 检测到 TTS>> 指令');
      console.log('[TTS] 当前 ttsSettings:', ttsSettings);
      console.log('[TTS] 语音列表已加载:', voicesLoaded);
      console.log('[TTS] 当前可用语音数量:', speechSynthesisRef.current?.getVoices()?.length || 0);

      // 如果语音列表还没有加载完成，等待加载
      if (!voicesLoaded || speechSynthesisRef.current?.getVoices().length === 0) {
        console.log('[TTS] 语音列表未加载，等待中...');
        // 等待语音列表加载
        const checkVoices = setInterval(() => {
          const voices = speechSynthesisRef.current?.getVoices();
          if (voices && voices.length > 0) {
            clearInterval(checkVoices);
            setVoicesLoaded(true);
            console.log('[TTS] 语音列表已加载，重新播放');
            // 重新触发播放
            setTimeout(() => {
              sendMessage();
            }, 100);
          }
        }, 100);
        return;
      }

      // 创建用户消息
      const userMessage: Message = {
        role: 'user',
        content: input,
        timestamp: new Date(),
      };

      // 添加消息后播放
      setMessages((prev) => {
        const newMessages = [...prev, userMessage];
        const newIndex = newMessages.length - 1;
        setInput('');

        // 等待消息更新后再播放
        setTimeout(() => {
          console.log('[TTS] 开始播放 TTS>> 消息，index:', newIndex);
          playTTS(input, newIndex);
        }, 100);

        return newMessages;
      });
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

      // 调用本地 API Route，由服务端代理调用智谱 API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: provider,
          model: modelName,
          baseUrl: modelConfig.baseUrl,
          messages: apiMessages,
          apiKey: modelConfig.apiKey, // 传递用户自定义的 API Key
        }),
        signal: abortController.signal,
      });

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
        reasoningContent: '',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      let buffer = '';
      let assistantContent = ''; // 回答内容
      let reasoningContent = ''; // 思考内容

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
              const delta = json.choices?.[0]?.delta || {};

              // 处理思考内容（reasoning_content）
              if (delta.reasoning_content) {
                reasoningContent += delta.reasoning_content;
              }

              // 处理回答内容（content）
              if (delta.content) {
                assistantContent += delta.content;
              }

              // 如果有内容更新，更新最后一个消息
              if (delta.reasoning_content || delta.content) {
                setMessages((prev) => {
                  const updated = [...prev];
                  const lastMessage = updated[updated.length - 1];
                  if (lastMessage && lastMessage.role === 'assistant') {
                    lastMessage.reasoningContent = reasoningContent;
                    lastMessage.content = assistantContent;
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
                onClick={() => setShowTTSSettings(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/20 rounded-lg transition-all"
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
                            onClick={() => handleDownloadTTS(message.content, index)}
                            disabled={downloadingMessageIndex === index}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-white dark:bg-sky-200/50 text-sky-700 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-200/50 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="下载音频"
                          >
                            <DownloadCloud size={14} />
                            <span>下载</span>
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
                            onClick={() => handleDownloadTTS(message.content, index)}
                            disabled={downloadingMessageIndex === index}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="下载音频"
                          >
                            <DownloadCloud size={14} />
                            <span>下载</span>
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
                      <div className="space-y-4">
                        {/* 思考过程部分 */}
                        {message.reasoningContent && (
                          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-amber-200 dark:border-amber-800">
                              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                              <span className="text-sm font-semibold text-amber-800 dark:text-amber-200">💭 思考过程</span>
                            </div>
                            <div className="text-sm text-amber-900 dark:text-amber-100 whitespace-pre-wrap">
                              {message.reasoningContent}
                            </div>
                          </div>
                        )}

                        {/* 回答内容部分 */}
                        {message.content && (
                          <div>
                            {message.reasoningContent && (
                              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-zinc-200 dark:border-zinc-700">
                                <Bot className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">📝 回答</span>
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
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
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
      <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-6">
          {/* 整体输入框容器 */}
          <div className="relative border border-zinc-200 dark:border-zinc-700 rounded-2xl bg-white dark:bg-zinc-800 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
            {/* 输入框 */}
            <textarea
              value={input}
              onChange={handleInputChange}
              placeholder="输入消息，按 Enter 发送消息，Shift + Enter 换行"
              rows={1}
              className="w-full px-6 py-4 pb-16 border-0 bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none resize-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !modelConfig}
              style={{
                minHeight: '120px',
                maxHeight: '300px',
              }}
              onKeyDown={(e) => {
                // 处理 Enter 键发送消息
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                  return;
                }

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
        onSettingsChange={setTTSSettings}
        currentSettings={ttsSettings}
      />
    </div>
  );
}
