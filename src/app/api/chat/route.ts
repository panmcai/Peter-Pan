import { NextRequest, NextResponse } from 'next/server';

// 定义动态路由配置，禁用缓存
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// API配置
const ZHIPU_API_KEY = process.env.ZHIPUAI_API_KEY || '';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  provider: string;
  model: string;
  baseUrl: string;
  messages: ChatMessage[];
  apiKey?: string; // 用户自定义的 API Key（可选）
  deepThink?: boolean; // 是否启用深度思考
  webSearch?: boolean; // 是否启用联网搜索
}

// 带超时的 fetch 函数
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = 120000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`请求超时（${timeout}ms）`);
    }
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { provider, model, baseUrl, messages, apiKey: userApiKey, deepThink, webSearch } = body;

    console.log('[Chat API] 收到请求:', { provider, model, messageCount: messages?.length });

    // 验证请求参数
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: '消息格式错误' }, { status: 400 });
    }

    let response: Response;

    if (provider === 'zhipu') {
      // 智谱 AI
      const requestBody: any = {
        model: model,
        messages: messages,
        stream: true,
      };

      // 添加深度思考和联网搜索参数
      if (deepThink) {
        requestBody.reasoning_config = {
          type: 'enable',
        };
      }

      if (webSearch) {
        requestBody.tools = [
          {
            type: 'web_search',
            web_search: {
              search_query: '',
              search_depth: 'auto',
              search_result_max_num: 10,
            },
          },
        ];
      }

      // 优先使用用户自定义的 API Key，否则使用环境变量
      const apiKey = userApiKey || ZHIPU_API_KEY;

      if (!apiKey) {
        console.error('[Chat API] 未配置 API Key');
        return NextResponse.json(
          { error: '未配置 API Key，请在环境变量中设置 ZHIPUAI_API_KEY' },
          { status: 500 }
        );
      }

      console.log(
        '[Chat API] 使用智谱 API，模型:',
        model,
        '深度思考:',
        deepThink,
        '联网搜索:',
        webSearch
      );

      response = await fetchWithTimeout(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });
    } else if (provider === 'deepseek') {
      // DeepSeek
      const requestBody: any = {
        model: model,
        messages: messages,
        stream: true,
      };

      // 优先使用用户自定义的 API Key，否则使用环境变量
      const apiKey = userApiKey || DEEPSEEK_API_KEY;

      if (!apiKey) {
        console.error('[Chat API] 未配置 API Key');
        return NextResponse.json(
          { error: '未配置 API Key，请在环境变量中设置 DEEPSEEK_API_KEY' },
          { status: 500 }
        );
      }

      console.log('[Chat API] 使用 DeepSeek API，模型:', model);

      response = await fetchWithTimeout(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });
    } else {
      // OpenAI 兼容格式
      const requestBody = {
        model: model,
        messages: messages,
        stream: true,
      };

      if (!userApiKey) {
        console.error('[Chat API] OpenAI 兼容格式需要提供 API Key');
        return NextResponse.json({ error: '请提供 API Key' }, { status: 400 });
      }

      console.log('[Chat API] 使用 OpenAI 兼容格式，模型:', model);

      response = await fetchWithTimeout(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userApiKey}`,
        },
        body: JSON.stringify(requestBody),
      });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[Chat API] API 调用失败:', response.status, errorData);
      return NextResponse.json(
        { error: errorData.error?.message || `HTTP error! status: ${response.status}` },
        { status: response.status }
      );
    }

    // 流式响应
    const reader = response.body?.getReader();
    const encoder = new TextEncoder();

    if (!reader) {
      throw new Error('无法读取响应流');
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              controller.close();
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);

                if (data === '[DONE]') {
                  continue;
                }

                controller.enqueue(encoder.encode(line + '\n'));
              }
            }
          }
        } catch (error) {
          console.error('[Chat API] 流式传输错误:', error);
          controller.error(error);
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('[Chat API] 服务器错误:', error);
    return NextResponse.json({ error: error.message || '服务器内部错误' }, { status: 500 });
  }
}
