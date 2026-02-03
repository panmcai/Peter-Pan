import { NextRequest } from 'next/server';

/**
 * AI 聊天 API 路由 - 支持流式输出、深度思考和联网搜索
 *
 * 使用方法：
 * POST /api/chat/stream
 * Body: {
 *   message: "你好",
 *   model: "glm-4",
 *   provider: "zhipu",
 *   apiKey: "your_api_key",
 *   baseUrl: "custom_base_url", // 可选
 *   deepThink: true,  // 是否启用深度思考
 *   webSearch: false  // 是否启用联网搜索
 * }
 */

interface ChatRequest {
  message: string;
  model: string;
  provider: string;
  apiKey: string;
  baseUrl?: string;
  deepThink?: boolean;
  webSearch?: boolean;
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

// 深度思考提示词
const DEEP_THINK_PROMPT = `请你对以下问题进行深度思考。在给出最终答案之前，请先分步骤列出你的分析逻辑、考虑的可能性以及排除错误选项的过程，最后再输出结论。

建议格式：
1. 分析问题：拆解问题的关键点和要求
2. 思考过程：列出可能的解决方案、推理逻辑
3. 综合判断：权衡各方案的利弊
4. 最终结论：给出明确的答案

用户问题：`;

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, model, provider, apiKey, baseUrl: customBaseUrl, deepThink = false, webSearch = false } = body;

    // 验证输入
    if (!message) {
      return new Response(JSON.stringify({ error: '缺少 message 参数' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!provider || !apiKey || !model) {
      return new Response(JSON.stringify({ error: '缺少必需参数' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const providerConfig = PROVIDER_CONFIGS[provider];
    if (!providerConfig) {
      return new Response(JSON.stringify({ error: `不支持的提供商: ${provider}` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 创建流式响应
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const baseUrl = customBaseUrl || providerConfig.baseUrl;
          const apiUrl = `${baseUrl}/chat/completions`;
          const headers = providerConfig.headersBuilder(apiKey);

          // 构建消息内容
          let systemPrompt = '你是一个有用的AI助手。';
          let userMessage = message;

          // 深度思考模式：添加提示词前缀
          if (deepThink) {
            userMessage = DEEP_THINK_PROMPT + message;
          }

          // 构建请求体
          const requestBody: any = {
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userMessage },
            ],
            temperature: 0.7,
            max_tokens: 4096,
            stream: true,
          };

          // 联网搜索模式：添加 web_search 工具
          if (webSearch) {
            requestBody.tools = [
              {
                type: 'web_search',
                web_search: {
                  enable: true,
                  search_query: message, // 让模型基于用户问题进行搜索
                },
              },
            ];
          }

          // 调用大模型 API
          console.log(`调用 ${provider} API: ${apiUrl}`);
          console.log('请求体:', JSON.stringify({ ...requestBody, apiKey: '***' }));

          const response = await fetch(apiUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('API 调用失败:', errorText);
            throw new Error(`API 调用失败: ${response.status} - ${errorText}`);
          }

          // 处理流式响应
          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error('无法获取响应流');
          }

          const decoder = new TextDecoder();
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
                if (data === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(data);

                  // 处理不同格式的流式响应
                  let content = '';

                  // OpenAI/DeepSeek 格式
                  if (parsed.choices?.[0]?.delta?.content) {
                    content = parsed.choices[0].delta.content;
                  }
                  // 工具调用响应
                  else if (parsed.choices?.[0]?.delta?.tool_calls) {
                    content = '🔍 正在联网搜索...\n';
                  }

                  if (content) {
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ type: 'content', content })}\n\n`)
                    );
                  }
                } catch (e) {
                  console.error('解析流数据失败:', e);
                }
              }
            }
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } catch (error) {
          console.error('流式处理错误:', error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'error', error: error instanceof Error ? error.message : '未知错误' })}\n\n`
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('API 错误:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : '未知错误' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
