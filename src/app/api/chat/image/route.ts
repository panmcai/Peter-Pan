import { NextRequest } from 'next/server';

/**
 * AI 图片生成 API 路由 - 支持智谱AI CogView 模型
 *
 * 使用方法：
 * POST /api/chat/image
 * Body: {
 *   prompt: "一只可爱的猫",
 *   model: "cogview-3-flash",
 *   apiKey: "your_api_key",
 *   baseUrl: "custom_base_url" // 可选
 * }
 */

interface ImageRequest {
  prompt: string;
  model: string;
  apiKey: string;
  baseUrl?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ImageRequest = await request.json();
    const { prompt, model, apiKey, baseUrl: customBaseUrl } = body;

    // 验证输入
    if (!prompt) {
      return new Response(JSON.stringify({ error: '缺少 prompt 参数' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 如果没有提供 apiKey，使用环境变量
    let finalApiKey = apiKey;
    if (!finalApiKey) {
      finalApiKey = process.env.ZHIPUAI_API_KEY || '';
    }

    if (!finalApiKey) {
      return new Response(JSON.stringify({ error: '缺少 API Key' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const baseUrl = customBaseUrl || 'https://open.bigmodel.cn/api/paas/v4';
    const apiUrl = `${baseUrl}/images/generations`;

    console.log(`调用智谱AI文生图API: ${apiUrl}`);
    console.log('请求体:', JSON.stringify({ model, prompt }));

    // 调用智谱AI文生图API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${finalApiKey}`,
      },
      body: JSON.stringify({
        model,
        prompt,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API 调用失败:', errorText);
      throw new Error(`API 调用失败: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    console.log('API 响应:', JSON.stringify(data));

    // 检查响应格式
    if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
      throw new Error('API 返回数据格式错误');
    }

    const imageUrl = data.data[0].url;

    if (!imageUrl) {
      throw new Error('未获取到图片URL');
    }

    // 返回图片URL
    return new Response(
      JSON.stringify({
        type: 'image',
        imageUrl,
        prompt,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('文生图API错误:', error);
    const errorMessage = error instanceof Error ? error.message : '生成图片失败';

    return new Response(
      JSON.stringify({
        error: errorMessage,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
