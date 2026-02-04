'use client';

import { useState, useEffect } from 'react';
import { Volume2, Volume1, Music, Zap, ChevronDown, Check, Save, Play, RotateCcw, Loader2 } from 'lucide-react';

export interface TTSSettings {
  enabled: boolean;
  volume: number;      // 0-1
  rate: number;        // 0.1-2
  pitch: number;       // 0-2
  voiceURI: string;    // 语音 URI
  lang: string;        // 语言
}

interface TTSSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange: (settings: TTSSettings) => void;
  currentSettings?: TTSSettings;
}

// 默认设置
const DEFAULT_SETTINGS: TTSSettings = {
  enabled: true,
  volume: 1.0,
  rate: 1.0,
  pitch: 1.0,
  voiceURI: '',
  lang: 'zh-CN',
};

export default function TTSSettings({ isOpen, onClose, onSettingsChange, currentSettings }: TTSSettingsProps) {
  const [enabled, setEnabled] = useState(currentSettings?.enabled ?? true);
  const [volume, setVolume] = useState(currentSettings?.volume ?? 1.0);
  const [rate, setRate] = useState(currentSettings?.rate ?? 1.0);
  const [pitch, setPitch] = useState(currentSettings?.pitch ?? 1.0);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState(currentSettings?.voiceURI ?? '');
  const [selectedLang, setSelectedLang] = useState(currentSettings?.lang ?? 'zh-CN');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [filteredVoices, setFilteredVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [showVoiceList, setShowVoiceList] = useState(false);

  // 从 localStorage 加载设置
  useEffect(() => {
    const saved = localStorage.getItem('tts-settings');
    if (saved && !currentSettings) {
      const settings: TTSSettings = JSON.parse(saved);
      setEnabled(settings.enabled);
      setVolume(settings.volume);
      setRate(settings.rate);
      setPitch(settings.pitch);
      setSelectedVoiceURI(settings.voiceURI);
      setSelectedLang(settings.lang);
    }
  }, [currentSettings]);

  // 获取可用语音
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // 根据语言过滤语音
  useEffect(() => {
    if (availableVoices.length > 0) {
      const filtered = availableVoices.filter(voice =>
        voice.lang.includes(selectedLang)
      ).sort((a, b) => {
        // 优先显示 Neural 语音
        const aNeural = a.name.includes('Neural') || a.name.includes('Wavenet');
        const bNeural = b.name.includes('Neural') || b.name.includes('Wavenet');
        if (aNeural && !bNeural) return -1;
        if (!aNeural && bNeural) return 1;
        return a.name.localeCompare(b.name);
      });
      setFilteredVoices(filtered);

      // 如果当前选择的语音不在过滤后的列表中，重置为第一个
      if (selectedVoiceURI && !filtered.find(v => v.voiceURI === selectedVoiceURI)) {
        setSelectedVoiceURI('');
      }
    }
  }, [availableVoices, selectedLang, selectedVoiceURI]);

  // 保存设置
  const handleSave = () => {
    const settings: TTSSettings = {
      enabled,
      volume,
      rate,
      pitch,
      voiceURI: selectedVoiceURI,
      lang: selectedLang,
    };

    localStorage.setItem('tts-settings', JSON.stringify(settings));
    onSettingsChange(settings);
    onClose();
  };

  // 重置为默认设置
  const handleReset = () => {
    setEnabled(DEFAULT_SETTINGS.enabled);
    setVolume(DEFAULT_SETTINGS.volume);
    setRate(DEFAULT_SETTINGS.rate);
    setPitch(DEFAULT_SETTINGS.pitch);
    setSelectedVoiceURI(DEFAULT_SETTINGS.voiceURI);
    setSelectedLang(DEFAULT_SETTINGS.lang);
  };

  // 测试语音
  const handleTestVoice = () => {
    if (!window.speechSynthesis) {
      alert('您的浏览器不支持语音合成功能');
      return;
    }

    setIsTestingVoice(true);
    window.speechSynthesis.cancel(); // 停止当前播放

    const utterance = new SpeechSynthesisUtterance('这是一段语音测试，你好！');
    utterance.volume = volume;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.lang = selectedLang;

    const voice = filteredVoices.find(v => v.voiceURI === selectedVoiceURI);
    if (voice) {
      utterance.voice = voice;
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
  const selectedVoice = filteredVoices.find(v => v.voiceURI === selectedVoiceURI);
  const voiceDisplayName = selectedVoice
    ? `${selectedVoice.name} (${selectedVoice.lang})`
    : selectedVoiceURI
    ? selectedVoiceURI
    : '默认语音';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <Volume2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
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
          <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-xl">
            <p className="text-sm text-purple-900 dark:text-purple-100">
              💡 配置语音朗读功能，让 AI 助手的回复可以朗读出来。您的设置将保存在本地浏览器中。
            </p>
          </div>

          {/* 启用开关 */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                启用语音朗读
              </span>
            </div>
            <button
              onClick={() => setEnabled(!enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                enabled ? 'bg-purple-600' : 'bg-zinc-300 dark:bg-zinc-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* 音量控制 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                <Volume2 className="w-4 h-4" />
                音量
              </label>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              disabled={!enabled}
              className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed accent-purple-600"
            />
          </div>

          {/* 语速控制 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                <Zap className="w-4 h-4" />
                语速
              </label>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">{rate}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              disabled={!enabled}
              className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed accent-purple-600"
            />
            <div className="flex justify-between text-xs text-zinc-400 dark:text-zinc-500 mt-1">
              <span>0.5x (慢)</span>
              <span>2x (快)</span>
            </div>
          </div>

          {/* 音调控制 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                <Music className="w-4 h-4" />
                音调
              </label>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">{pitch}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              disabled={!enabled}
              className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed accent-purple-600"
            />
            <div className="flex justify-between text-xs text-zinc-400 dark:text-zinc-500 mt-1">
              <span>0.5x (低)</span>
              <span>2x (高)</span>
            </div>
          </div>

          {/* 语言选择 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              语言
            </label>
            <select
              value={selectedLang}
              onChange={(e) => {
                setSelectedLang(e.target.value);
                setSelectedVoiceURI('');
              }}
              disabled={!enabled}
              className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="zh-CN">中文（简体）</option>
              <option value="zh-TW">中文（繁体）</option>
              <option value="en-US">英语（美国）</option>
              <option value="en-GB">英语（英国）</option>
              <option value="ja-JP">日语</option>
              <option value="ko-KR">韩语</option>
              <option value="fr-FR">法语</option>
              <option value="de-DE">德语</option>
              <option value="es-ES">西班牙语</option>
              <option value="ru-RU">俄语</option>
            </select>
          </div>

          {/* 语音选择 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              语音音色
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowVoiceList(!showVoiceList)}
                disabled={!enabled || filteredVoices.length === 0}
                className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-left flex items-center justify-between"
              >
                <span className="truncate">{voiceDisplayName}</span>
                <ChevronDown className={`w-5 h-5 transition-transform ${showVoiceList ? 'rotate-180' : ''}`} />
              </button>

              {showVoiceList && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedVoiceURI('');
                      setShowVoiceList(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2 ${
                      selectedVoiceURI === '' ? 'bg-purple-50 dark:bg-purple-950/20' : ''
                    }`}
                  >
                    {!selectedVoiceURI && <Check className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                    <span>默认语音</span>
                  </button>
                  {filteredVoices.map((voice) => (
                    <button
                      key={voice.voiceURI}
                      type="button"
                      onClick={() => {
                        setSelectedVoiceURI(voice.voiceURI);
                        setShowVoiceList(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2 ${
                        selectedVoiceURI === voice.voiceURI ? 'bg-purple-50 dark:bg-purple-950/20' : ''
                      }`}
                    >
                      {selectedVoiceURI === voice.voiceURI && (
                        <Check className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="truncate font-medium text-zinc-900 dark:text-zinc-100">
                          {voice.name}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                          {voice.lang}
                          {voice.name.includes('Neural') && (
                            <span className="ml-2 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs">
                              Neural
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {filteredVoices.length === 0 && (
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                该语言暂无可用语音
              </p>
            )}
          </div>

          {/* 测试按钮 */}
          <button
            type="button"
            onClick={handleTestVoice}
            disabled={!enabled || isTestingVoice}
            className="w-full mb-6 px-4 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* 底部按钮 */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
          <button
            onClick={handleReset}
            className="px-4 py-2.5 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition-colors font-medium flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            重置
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors font-medium"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white rounded-xl transition-colors font-medium flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              保存设置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
