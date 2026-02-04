'use client';

import { useState, useEffect } from 'react';
import { Volume2, Check, Save, Play, ChevronDown, Loader2, Languages } from 'lucide-react';

export interface VoiceSettings {
  lang: string;
  voiceURI: string;
  voiceName: string;
}

export interface TTSSettings {
  voices: VoiceSettings[];
}

interface TTSSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange: (settings: TTSSettings) => void;
  currentSettings?: TTSSettings;
}

export default function TTSSettings({ isOpen, onClose, onSettingsChange, currentSettings }: TTSSettingsProps) {
  const [selectedLang, setSelectedLang] = useState<string>('zh');
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings[]>([]);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [showVoiceList, setShowVoiceList] = useState(false);
  const [showLangList, setShowLangList] = useState(false);

  // 从 localStorage 加载设置
  useEffect(() => {
    const saved = localStorage.getItem('tts-voice-settings');
    if (saved && !currentSettings) {
      const settings: TTSSettings = JSON.parse(saved);
      setVoiceSettings(settings.voices || []);
    } else if (currentSettings) {
      setVoiceSettings(currentSettings.voices || []);
    }
  }, [currentSettings]);

  // 获取可用语音
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log('[TTS] 获取到', voices.length, '个语音');
        setAvailableVoices(voices);
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // 获取当前语言的语音设置
  const currentVoiceSetting = voiceSettings.find(v => v.lang === selectedLang);
  const selectedVoiceURI = currentVoiceSetting?.voiceURI || '';

  // 保存设置
  const handleSave = () => {
    const updatedSettings = [...voiceSettings];

    // 查找当前语言是否已有设置
    const existingIndex = updatedSettings.findIndex(v => v.lang === selectedLang);
    const selectedVoice = availableVoices.find(v => v.voiceURI === selectedVoiceURI);

    if (selectedVoiceURI) {
      const newSetting: VoiceSettings = {
        lang: selectedLang,
        voiceURI: selectedVoiceURI,
        voiceName: selectedVoice?.name || '',
      };

      if (existingIndex >= 0) {
        updatedSettings[existingIndex] = newSetting;
      } else {
        updatedSettings.push(newSetting);
      }
    } else if (existingIndex >= 0) {
      // 如果选择了默认语音，删除该语言的设置
      updatedSettings.splice(existingIndex, 1);
    }

    const settings: TTSSettings = {
      voices: updatedSettings,
    };

    localStorage.setItem('tts-voice-settings', JSON.stringify(settings));
    onSettingsChange(settings);
    onClose();
  };

  // 测试语音
  const handleTestVoice = () => {
    if (!window.speechSynthesis) {
      alert('您的浏览器不支持语音合成功能');
      return;
    }

    setIsTestingVoice(true);
    window.speechSynthesis.cancel();

    // 根据选择的语言生成测试文本
    const testTexts: Record<string, string> = {
      'zh': '这是语音测试，你好！',
      'en': 'Hello! This is a voice test.',
      'ja': 'こんにちは！これは音声テストです。',
      'ko': '안녕하세요! 이것은 음성 테스트입니다.',
      'fr': 'Bonjour! Ceci est un test vocal.',
      'de': 'Hallo! Dies ist ein Sprachtest.',
      'es': '¡Hola! Esta es una prueba de voz.',
      'ru': 'Привет! Это голосовой тест.',
      'it': 'Ciao! Questo è un test vocale.',
      'pt': 'Olá! Este é um teste de voz.',
    };

    const testText = testTexts[selectedLang] || 'Hello! This is a voice test.';

    const utterance = new SpeechSynthesisUtterance(testText);
    utterance.lang = selectedLang;

    const voice = availableVoices.find(v => v.voiceURI === selectedVoiceURI);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }

    utterance.onend = () => {
      setIsTestingVoice(false);
    };

    utterance.onerror = () => {
      setIsTestingVoice(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // 获取当前选中的语音名称
  const selectedVoice = availableVoices.find(v => v.voiceURI === selectedVoiceURI);
  const voiceDisplayName = selectedVoice
    ? selectedVoice.name
    : selectedVoiceURI
    ? selectedVoiceURI
    : '默认语音';

  // 获取语言显示名称
  const getLanguageName = (code: string) => {
    const languages: Record<string, string> = {
      'zh': '中文',
      'en': '英语',
      'ja': '日语',
      'ko': '韩语',
      'fr': '法语',
      'de': '德语',
      'es': '西班牙语',
      'ru': '俄语',
      'it': '意大利语',
      'pt': '葡萄牙语',
    };
    return languages[code] || code;
  };

  // 获取完整语言显示名称（包括地区）
  const getFullLanguageName = (langCode: string) => {
    const [primaryLang, region] = langCode.split('-');

    const regionNames: Record<string, string> = {
      'CN': '（中国大陆）',
      'TW': '（台湾）',
      'HK': '（香港）',
      'US': '（美国）',
      'GB': '（英国）',
      'AU': '（澳大利亚）',
      'CA': '（加拿大）',
      'ZA': '（南非）',
      'IN': '（印度）',
      'JP': '（日本）',
      'KR': '（韩国）',
      'FR': '（法国）',
      'DE': '（德国）',
      'ES': '（西班牙）',
      'IT': '（意大利）',
      'PT': '（葡萄牙）',
      'BR': '（巴西）',
      'RU': '（俄罗斯）',
    };

    const primaryName = getLanguageName(primaryLang);
    const regionName = region ? (regionNames[region] || `（${region}）`) : '';

    return primaryName + regionName;
  };

  // 获取可用语言列表
  const getAvailableLanguages = () => {
    const langSet = new Set<string>();
    availableVoices.forEach(voice => {
      const lang = voice.lang.split('-')[0];
      langSet.add(lang);
    });
    return Array.from(langSet).sort((a, b) => {
      if (a === 'zh') return -1;
      if (b === 'zh') return 1;
      return a.localeCompare(b);
    });
  };

  // 获取当前语言的语音列表
  const getCurrentLanguageVoices = () => {
    return availableVoices
      .filter(voice => voice.lang.startsWith(selectedLang))
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  const currentLangVoices = getCurrentLanguageVoices();
  const availableLanguages = getAvailableLanguages();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <Volume2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              语音朗读设置
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <span className="text-zinc-500 dark:text-zinc-400 text-2xl leading-none">×</span>
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* 提示信息 */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              💡 按语言配置语音音色。系统会根据消息内容自动选择对应语言的音色。共检测到 {availableVoices.length} 个可用语音。
            </p>
          </div>

          {/* 语言选择 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4" />
                选择语言
              </div>
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLangList(!showLangList)}
                className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-left flex items-center justify-between"
              >
                <span className="truncate">{getLanguageName(selectedLang)}</span>
                <ChevronDown className={`w-5 h-5 transition-transform flex-shrink-0 ${showLangList ? 'rotate-180' : ''}`} />
              </button>

              {showLangList && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                  {availableLanguages.map((lang) => {
                    const setting = voiceSettings.find(v => v.lang === lang);
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => {
                          setSelectedLang(lang);
                          setShowLangList(false);
                          setShowVoiceList(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex items-center justify-between ${
                          selectedLang === lang ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                        }`}
                      >
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">{getLanguageName(lang)}</span>
                        {setting && (
                          <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                            已配置
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 语音选择 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              选择 {getLanguageName(selectedLang)} 音色
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowVoiceList(!showVoiceList)}
                className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-left flex items-center justify-between"
              >
                <span className="truncate">{voiceDisplayName}</span>
                <ChevronDown className={`w-5 h-5 transition-transform flex-shrink-0 ${showVoiceList ? 'rotate-180' : ''}`} />
              </button>

              {showVoiceList && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl max-h-64 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      const updated = voiceSettings.filter(v => v.lang !== selectedLang);
                      setVoiceSettings(updated);
                      setShowVoiceList(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2 ${
                      selectedVoiceURI === '' ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                    }`}
                  >
                    {!selectedVoiceURI && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                    <span>默认语音</span>
                  </button>

                  {currentLangVoices.map((voice) => (
                    <button
                      key={voice.voiceURI}
                      type="button"
                      onClick={() => {
                        const updated = [...voiceSettings];
                        const index = updated.findIndex(v => v.lang === selectedLang);
                        const newSetting: VoiceSettings = {
                          lang: selectedLang,
                          voiceURI: voice.voiceURI,
                          voiceName: voice.name,
                        };
                        if (index >= 0) {
                          updated[index] = newSetting;
                        } else {
                          updated.push(newSetting);
                        }
                        setVoiceSettings(updated);
                        setShowVoiceList(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2 ${
                        selectedVoiceURI === voice.voiceURI ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                      }`}
                    >
                      {selectedVoiceURI === voice.voiceURI && (
                        <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="truncate font-medium text-zinc-900 dark:text-zinc-100 text-sm">
                          {voice.name}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2 flex-wrap">
                          <span>{getFullLanguageName(voice.lang)}</span>
                          {voice.name.includes('Neural') && (
                            <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
                              Neural
                            </span>
                          )}
                          {voice.name.includes('Wavenet') && (
                            <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs">
                              Wavenet
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {currentLangVoices.length === 0 && (
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                该语言暂无可用语音
              </p>
            )}

            {/* 测试按钮 */}
            <button
              type="button"
              onClick={handleTestVoice}
              disabled={isTestingVoice || currentLangVoices.length === 0}
              className="w-full mt-4 px-4 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTestingVoice ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  正在测试...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  测试语音效果
                </>
              )}
            </button>
          </div>

          {/* 常用语音说明 */}
          {selectedLang === 'zh' && (
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
              <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                常用中文 Neural 语音
              </h3>
              <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
                <li>• <strong>晓晓 (XiaoxiaoNeural)</strong> - 女声，温柔自然</li>
                <li>• <strong>云扬 (YunyangNeural)</strong> - 男声，沉稳有力</li>
                <li>• <strong>云希 (YunxiNeural)</strong> - 男声，年轻活力</li>
                <li>• <strong>晓伊 (XiaoyiNeural)</strong> - 女声，甜美可爱</li>
                <li>• <strong>建豪 (JianhaoNeural)</strong> - 男声，成熟稳重</li>
              </ul>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors font-medium"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl transition-colors font-medium flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            保存设置
          </button>
        </div>
      </div>
    </div>
  );
}
