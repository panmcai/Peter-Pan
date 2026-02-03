'use client';

import { useState, useEffect } from 'react';
import { Settings, Key, Globe, Check, X, ChevronDown, ChevronUp } from 'lucide-react';

export interface AIModelConfig {
  provider: string;
  name: string;
  apiKey: string;
  baseUrl?: string;
  models: string[];
  enabled: boolean;
}

interface ModelConfigProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChange: (config: AIModelConfig) => void;
  currentConfig?: AIModelConfig;
}

// 支持的大模型提供商
const MODEL_PROVIDERS = [
  {
    id: 'zhipu',
    name: '智谱 AI',
    icon: '🤖',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    models: ['glm-4.7-flash', 'GLM-4.6V-Flash', 'glm-4-flash', 'glm-z1-flash', 'glm-4', 'glm-4-plus', 'glm-4-air', 'glm-4v', 'CogView-3-Flash', 'CogVideoX-Flash'],
    apiKeyPlaceholder: 'your_zhipuai_api_key',
    docUrl: 'https://open.bigmodel.cn/',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    icon: '🌐',
    baseUrl: 'https://api.openai.com/v1',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    apiKeyPlaceholder: 'sk-...',
    docUrl: 'https://platform.openai.com/',
  },
  {
    id: 'anthropic',
    name: 'Anthropic (Claude)',
    icon: '🧠',
    baseUrl: 'https://api.anthropic.com/v1',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'],
    apiKeyPlaceholder: 'sk-ant-...',
    docUrl: 'https://docs.anthropic.com/',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    icon: '🔍',
    baseUrl: 'https://api.deepseek.com',
    models: ['deepseek-chat', 'deepseek-coder'],
    apiKeyPlaceholder: 'sk-...',
    docUrl: 'https://platform.deepseek.com/',
  },
  {
    id: 'qwen',
    name: '阿里通义千问',
    icon: '🌟',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    models: ['qwen-plus', 'qwen-turbo', 'qwen-max', 'qwen-coder-plus'],
    apiKeyPlaceholder: 'sk-...',
    docUrl: 'https://dashscope.aliyun.com/',
  },
  {
    id: 'moonshot',
    name: '月之暗面 (Kimi)',
    icon: '🌙',
    baseUrl: 'https://api.moonshot.cn/v1',
    models: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'],
    apiKeyPlaceholder: 'sk-...',
    docUrl: 'https://platform.moonshot.cn/',
  },
  {
    id: 'baichuan',
    name: '百川智能',
    icon: '🌊',
    baseUrl: 'https://api.baichuan-ai.com/v1',
    models: ['Baichuan4', 'Baichuan3-Turbo', 'Baichuan3-Turbo-128k'],
    apiKeyPlaceholder: 'sk-...',
    docUrl: 'https://platform.baichuan-ai.com/',
  },
  {
    id: 'yi',
    name: '零一万物',
    icon: '💎',
    baseUrl: 'https://api.lingyiwanwu.com/v1',
    models: ['yi-lightning', 'yi-large', 'yi-large-turbo'],
    apiKeyPlaceholder: 'your_api_key',
    docUrl: 'https://platform.lingyiwanwu.com/',
  },
];

export default function ModelConfig({ isOpen, onClose, onConfigChange, currentConfig }: ModelConfigProps) {
  const [selectedProvider, setSelectedProvider] = useState<string>(currentConfig?.provider || 'zhipu');
  const zhipuProvider = MODEL_PROVIDERS.find(p => p.id === 'zhipu');
  const defaultModel = zhipuProvider?.models[0] || 'glm-z1-flash';
  const [selectedModel, setSelectedModel] = useState<string>(currentConfig?.models[0] || defaultModel);
  const [apiKey, setApiKey] = useState(currentConfig?.apiKey || '');
  const [customBaseUrl, setCustomBaseUrl] = useState(currentConfig?.baseUrl || '');
  const [isExpanded, setIsExpanded] = useState(false);
  const [savedConfigs, setSavedConfigs] = useState<Record<string, AIModelConfig>>({});

  // 从 localStorage 加载已保存的配置
  useEffect(() => {
    const saved = localStorage.getItem('ai-model-configs');
    if (saved) {
      setSavedConfigs(JSON.parse(saved));
    }
  }, []);

  // 选择提供商
  const handleProviderChange = (providerId: string) => {
    setSelectedProvider(providerId);
    const provider = MODEL_PROVIDERS.find(p => p.id === providerId);
    if (provider) {
      setSelectedModel(provider.models[0]);
      setCustomBaseUrl('');
    }
  };

  // 保存配置
  const handleSave = () => {
    const provider = MODEL_PROVIDERS.find(p => p.id === selectedProvider);
    if (!provider) return;

    const config: AIModelConfig = {
      provider: selectedProvider,
      name: provider.name,
      apiKey,
      baseUrl: customBaseUrl || provider.baseUrl,
      models: [selectedModel],
      enabled: true,
    };

    // 保存到 localStorage
    const newSavedConfigs = {
      ...savedConfigs,
      [selectedProvider]: config,
    };
    setSavedConfigs(newSavedConfigs);
    localStorage.setItem('ai-model-configs', JSON.stringify(newSavedConfigs));

    onConfigChange(config);
    onClose();
  };

  // 使用已保存的配置
  const handleUseSavedConfig = (providerId: string) => {
    const config = savedConfigs[providerId];
    if (config) {
      setSelectedProvider(providerId);
      setApiKey(config.apiKey);
      setCustomBaseUrl(config.baseUrl || '');
      setSelectedModel(config.models[0]);
      setIsExpanded(false);
    }
  };

  // 删除已保存的配置
  const handleDeleteConfig = (providerId: string) => {
    const newSavedConfigs = { ...savedConfigs };
    delete newSavedConfigs[providerId];
    setSavedConfigs(newSavedConfigs);
    localStorage.setItem('ai-model-configs', JSON.stringify(newSavedConfigs));
  };

  const provider = MODEL_PROVIDERS.find(p => p.id === selectedProvider);
  const hasApiKey = !!apiKey.trim();
  const savedConfig = savedConfigs[selectedProvider];

  // 判断是否可以使用默认API Key
  const canUseDefaultKey = selectedProvider === 'zhipu';
  const isDefaultKeyMode = !hasApiKey && canUseDefaultKey;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              大模型配置
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* 提示信息 */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              💡 选择一个大模型提供商，输入您的 API Key 即可使用。您的 API Key 仅存储在本地浏览器中，不会发送到我们的服务器。
            </p>
          </div>

          {/* 已保存的配置 */}
          {Object.keys(savedConfigs).length > 0 && (
            <div className="mb-6">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-between w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
              >
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  已保存的配置 ({Object.keys(savedConfigs).length})
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                )}
              </button>

              {isExpanded && (
                <div className="mt-3 space-y-2">
                  {Object.entries(savedConfigs).map(([providerId, config]) => {
                    const provider = MODEL_PROVIDERS.find(p => p.id === providerId);
                    return (
                      <div
                        key={providerId}
                        className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{provider?.icon}</span>
                          <div>
                            <p className="font-medium text-zinc-900 dark:text-zinc-100">
                              {config.name}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              {config.apiKey.substring(0, 10)}...{config.apiKey.substring(config.apiKey.length - 5)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUseSavedConfig(providerId)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
                          >
                            使用
                          </button>
                          <button
                            onClick={() => handleDeleteConfig(providerId)}
                            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="删除配置"
                          >
                            <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 提供商选择 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              选择提供商
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {MODEL_PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleProviderChange(p.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    selectedProvider === p.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                      : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                  }`}
                >
                  <span className="text-2xl">{p.icon}</span>
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {p.name}
                  </span>
                  {savedConfigs[p.id] && (
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 模型选择 */}
          {provider && (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  选择模型
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {provider.models.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>

              {/* API Key 输入 */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  <Key className="w-4 h-4" />
                  API Key
                  {canUseDefaultKey && (
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-normal">
                      （可选）
                    </span>
                  )}
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={provider.apiKeyPlaceholder}
                  className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
                {canUseDefaultKey && (
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                    💡 留空将使用服务器默认的 {provider.name} API Key（由环境变量配置）
                  </p>
                )}
              </div>

              {/* 自定义 Base URL */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  <Globe className="w-4 h-4" />
                  Base URL
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 font-normal">
                    （可选，留空使用默认）
                  </span>
                </label>
                <input
                  type="text"
                  value={customBaseUrl}
                  onChange={(e) => setCustomBaseUrl(e.target.value)}
                  placeholder={provider.baseUrl}
                  className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>

              {/* 文档链接 */}
              <div className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                <a
                  href={provider.docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <Globe className="w-4 h-4" />
                  查看 {provider.name} 官方文档和 API Key 获取方式
                </a>
              </div>
            </>
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
            disabled={!hasApiKey && !canUseDefaultKey}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {savedConfig ? <Check className="w-4 h-4" /> : <Key className="w-4 h-4" />}
            {savedConfig ? '更新配置' : '保存配置'}
          </button>
        </div>
      </div>
    </div>
  );
}
