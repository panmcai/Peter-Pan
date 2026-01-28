import { NextRequest, NextResponse } from 'next/server';

/**
 * AI 聊天 API 路由 - 支持多种大模型
 *
 * 使用方法：
 * POST /api/chat
 * Body: {
 *   message: "你好",
 *   model: "glm-4",
 *   provider: "zhipu",
 *   apiKey: "your_api_key",
 *   baseUrl: "custom_base_url", // 可选
 *   stream: false
 * }
 *
 * 支持的提供商：
 * - zhipu (智谱 AI)
 * - openai (OpenAI)
 * - anthropic (Anthropic Claude)
 * - deepseek (DeepSeek)
 * - qwen (阿里通义千问)
 * - moonshot (月之暗面 Kimi)
 * - baichuan (百川智能)
 * - yi (零一万物)
 */

interface ChatRequest {
  message: string;
  model: string;
  provider: string;
  apiKey: string;
  baseUrl?: string;
  stream?: boolean;
}

// 提供商配置
const PROVIDER_CONFIGS: Record<string, { baseUrl: string; headersBuilder: (key: string) => HeadersInit }> = {
  zhipu: {
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    headersBuilder: (key) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    }),
  },
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    headersBuilder: (key) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    }),
  },
  anthropic: {
    baseUrl: 'https://api.anthropic.com/v1',
    headersBuilder: (key) => ({
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    }),
  },
  deepseek: {
    baseUrl: 'https://api.deepseek.com',
    headersBuilder: (key) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    }),
  },
  qwen: {
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    headersBuilder: (key) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    }),
  },
  moonshot: {
    baseUrl: 'https://api.moonshot.cn/v1',
    headersBuilder: (key) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    }),
  },
  baichuan: {
    baseUrl: 'https://api.baichuan-ai.com/v1',
    headersBuilder: (key) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    }),
  },
  yi: {
    baseUrl: 'https://api.lingyiwanwu.com/v1',
    headersBuilder: (key) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    }),
  },
};

export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body: ChatRequest = await request.json();
    const { message, model, provider, apiKey, baseUrl: customBaseUrl, stream = false } = body;

    // 验证输入
    if (!message) {
      return NextResponse.json(
        { error: '缺少 message 参数' },
        { status: 400 }
      );
    }

    if (!provider) {
      return NextResponse.json(
        { error: '缺少 provider 参数' },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: '缺少 apiKey 参数' },
        { status: 400 }
      );
    }

    if (!model) {
      return NextResponse.json(
        { error: '缺少 model 参数' },
        { status: 400 }
      );
    }

    // 获取提供商配置
    const providerConfig = PROVIDER_CONFIGS[provider];
    if (!providerConfig) {
      return NextResponse.json(
        { error: `不支持的提供商: ${provider}` },
        { status: 400 }
      );
    }

    // 构建 API URL
    const baseUrl = customBaseUrl || providerConfig.baseUrl;
    const apiUrl = `${baseUrl}/chat/completions`;

    // 构建请求头
    const headers = providerConfig.headersBuilder(apiKey);

    // 构建请求体
    let requestBody: any = {
      model,
      messages: [
        {
          role: 'system',
          content: '你是一个有用的AI助手。',
        },
        {
          role: 'user',
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 4096,
      stream,
    };

    // Anthropic 需要特殊处理
    if (provider === 'anthropic') {
      requestBody.max_tokens = 4096;
      requestBody.stream = false; // Anthropic 暂时不支持流式
    }

    // 调用大模型 API
    console.log(`调用 ${provider} API: ${apiUrl}`);
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    // 检查响应状态
    if (!response.ok) {
      let errorData: any = {};
      let errorMessage = 'API 调用失败';
      try {
        const responseText = await response.text();
        if (responseText) {
          try {
            errorData = JSON.parse(responseText);
            errorMessage = errorData.error?.message || errorData.message || errorMessage;
          } catch (e) {
            errorData = { rawError: responseText };
            errorMessage = `API 返回错误: ${responseText.substring(0, 200)}`;
          }
        }
      } catch (e) {
        errorData = { parseError: '无法解析错误响应' };
      }

      console.error(`${provider} API 调用失败:`, errorData);

      return NextResponse.json(
        {
          error: errorMessage,
          status: response.status,
          provider,
          details: errorData,
        },
        { status: response.status }
      );
    }

    // 处理流式响应
    if (stream && provider !== 'anthropic') {
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // 获取响应文本
    const responseText = await response.text();

    // 检查响应是否为空
    if (!responseText || responseText.trim() === '') {
      console.error(`${provider} API 返回空响应`);
      return NextResponse.json(
        {
          error: 'API 返回空响应',
          provider,
          details: '请检查 API Key 是否正确或稍后重试',
        },
        { status: 500 }
      );
    }

    // 解析 JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error(`解析 ${provider} JSON 失败:`, responseText);
      return NextResponse.json(
        {
          error: 'API 返回的数据格式不正确',
          provider,
          details: responseText.substring(0, 500),
        },
        { status: 500 }
      );
    }

    // 统一返回格式
    return NextResponse.json(data);
  } catch (error) {
    console.error('AI API 调用失败:', error);
    return NextResponse.json(
      {
        error: '内部服务器错误',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

/**
 * GET 请求：检查 API 配置状态和支持的提供商
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    providers: Object.keys(PROVIDER_CONFIGS),
    message: 'AI 聊天 API 已就绪',
  });
}
