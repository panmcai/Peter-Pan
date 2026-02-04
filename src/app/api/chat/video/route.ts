import { NextRequest } from 'next/server';

/**
 * AI 视频生成 API 路由 - 支持智谱AI CogVideoX 模型
 *
 * 使用方法：
 * POST /api/chat/video
 * Body: {
 *   prompt: "一只可爱的猫在花园里玩耍",
 *   model: "cogvideox-flash",
 *   apiKey: "your_api_key",
 *   baseUrl: "custom_base_url" // 可选
 * }
 */

interface VideoRequest {
  prompt: string;
  model: string;
  apiKey: string;
  baseUrl?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: VideoRequest = await request.json();
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
    const apiUrl = `${baseUrl}/videos/generations`;

    console.log(`调用智谱AI文生视频API: ${apiUrl}`);
    console.log('请求体:', JSON.stringify({ model, prompt }));

    // 调用智谱AI文生视频API
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

    // 智谱 AI 的视频生成是异步任务，返回的是任务 ID
    if (!data.id) {
      throw new Error('API 返回数据格式错误：缺少任务 ID');
    }

    const taskId = data.id;
    const taskStatus = data.task_status;

    // 如果任务已完成，直接返回结果
    if (taskStatus === 'SUCCESS') {
      if (!data.video_url) {
        throw new Error('任务成功但未获取到视频 URL');
      }
      return new Response(
        JSON.stringify({
          type: 'video',
          videoUrl: data.video_url,
          prompt,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 如果任务失败，抛出错误
    if (taskStatus === 'FAILED') {
      throw new Error(`视频生成任务失败: ${data.error_msg || '未知错误'}`);
    }

    // 如果任务处理中，轮询任务状态
    let attempts = 0;
    const maxAttempts = 30; // 最多轮询 30 次
    const pollInterval = 3000; // 每次间隔 3 秒

    console.log(`任务 ${taskId} 正在处理中，开始轮询...`);

    while (attempts < maxAttempts) {
      attempts++;
      await new Promise(resolve => setTimeout(resolve, pollInterval));

      console.log(`第 ${attempts} 次轮询任务 ${taskId}...`);

      // 查询任务状态 - 使用正确的智谱 AI API 路径
      const taskResponse = await fetch(`${baseUrl}/async-result/${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${finalApiKey}`,
        },
      });

      if (!taskResponse.ok) {
        const errorText = await taskResponse.text();
        console.error('查询任务状态失败:', errorText);
        throw new Error(`查询任务状态失败: ${taskResponse.status}`);
      }

      const taskData = await taskResponse.json();
      console.log(`任务状态查询响应:`, JSON.stringify(taskData));
      console.log(`任务状态: ${taskData.task_status}`);

      if (taskData.task_status === 'SUCCESS') {
        // 智谱 AI 的视频结果在 video_result 数组中
        if (!taskData.video_result || !Array.isArray(taskData.video_result) || taskData.video_result.length === 0) {
          throw new Error('任务成功但未获取到视频结果');
        }
        const videoUrl = taskData.video_result[0].url;
        if (!videoUrl) {
          throw new Error('任务成功但未获取到视频 URL');
        }
        console.log('视频生成成功:', videoUrl);
        return new Response(
          JSON.stringify({
            type: 'video',
            videoUrl,
            prompt,
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      if (taskData.task_status === 'FAILED') {
        throw new Error(`视频生成任务失败: ${taskData.error_msg || '未知错误'}`);
      }

      // 继续轮询
    }

    throw new Error('视频生成超时，请稍后重试');
  } catch (error) {
    console.error('文生视频API错误:', error);
    const errorMessage = error instanceof Error ? error.message : '生成视频失败';

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
