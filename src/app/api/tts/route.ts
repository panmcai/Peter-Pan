import { NextRequest, NextResponse } from 'next/server';
import { TTSClient, Config } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { text, speaker, audioFormat, sampleRate, speechRate, loudnessRate } = await request.json();

    // 验证必填参数
    if (!text) {
      return NextResponse.json(
        { error: '缺少必填参数: text' },
        { status: 400 }
      );
    }

    // 创建 TTS 客户端
    const config = new Config();
    const client = new TTSClient(config);

    // 调用 TTS API
    const response = await client.synthesize({
      uid: `user-${Date.now()}`,
      text: text,
      speaker: speaker || 'zh_female_xiaohe_uranus_bigtts',
      audioFormat: audioFormat || 'mp3',
      sampleRate: sampleRate || 24000,
      speechRate: speechRate || 0,
      loudnessRate: loudnessRate || 0,
    });

    return NextResponse.json({
      audioUri: response.audioUri,
      audioSize: response.audioSize,
    });
  } catch (error) {
    console.error('[TTS API] Error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: '语音合成失败' },
      { status: 500 }
    );
  }
}
