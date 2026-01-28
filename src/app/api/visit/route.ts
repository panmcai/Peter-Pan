import { NextResponse } from 'next/server';

// 定义动态路由配置，禁用缓存
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase 服务端配置（使用 Service Role Key）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('=== API Route 初始化 ===');
console.log('Supabase URL:', supabaseUrl ? 'configured' : 'missing');
console.log('Service Role Key:', supabaseServiceKey ? 'configured' : 'missing');

// 创建服务端客户端（使用 Service Role Key，绕过 RLS）
const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

export async function POST(request: NextRequest) {
  try {
    const { visitor_id, referrer, path } = await request.json();

    // 获取客户端 IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown';

    // 获取用户代理
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // 获取当前时间
    const now = new Date();

    console.log('=== 记录访问 ===');
    console.log('Visitor ID:', visitor_id);
    console.log('IP:', ip);
    console.log('Path:', path || '/');
    console.log('Time:', now.toISOString());

    // 1. 插入访问记录（适配实际表结构）
    console.log('Step 1: 插入 visits 表...');
    const { error: insertError } = await supabase
      .from('visits')
      .insert({
        path: path || '/',
        user_agent: userAgent,
        ip: ip,
        created_at: now.toISOString(),
      });

    if (insertError) {
      console.error('Error inserting visit:', JSON.stringify(insertError, null, 2));
      throw insertError;
    }
    console.log('✓ visits 表插入成功');

    // 2. 更新统计（适配实际表结构 - 使用读取-修改-写入模式）
    console.log('Step 2: 更新 visit_stats 表...');

    // 先读取当前值
    const { data: currentStats, error: readError } = await supabase
      .from('visit_stats')
      .select('*')
      .eq('id', 1)
      .single();

    if (readError) {
      console.error('Error reading stats:', JSON.stringify(readError, null, 2));
      throw readError;
    }

    // 计算新值
    const newTotalVisits = (currentStats.total_visits || 0) + 1;
    const newTodayVisits = (currentStats.today_visits || 0) + 1;

    console.log(`当前: total=${currentStats.total_visits}, today=${currentStats.today_visits}`);
    console.log(`更新后: total=${newTotalVisits}, today=${newTodayVisits}`);

    // 更新
    const { error: updateError } = await supabase
      .from('visit_stats')
      .update({
        total_visits: newTotalVisits,
        today_visits: newTodayVisits,
        last_updated_at: now.toISOString(),
      })
      .eq('id', 1);

    if (updateError) {
      console.error('Error updating stats:', JSON.stringify(updateError, null, 2));
      throw updateError;
    }
    console.log('✓ 统计更新成功');

    return NextResponse.json(
      { success: true },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      }
    );
  } catch (error) {
    console.error('Visit recording error:', JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: 'Failed to record visit' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log('=== 获取访问统计 ===');

    // 获取总访问量（适配实际表结构）
    const { data: stats, error } = await supabase
      .from('visit_stats')
      .select('total_visits')
      .eq('id', 1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching visit count:', JSON.stringify(error, null, 2));
      throw error;
    }

    const totalVisits = stats?.total_visits || 0;
    console.log('Total visits:', totalVisits);

    // 禁用缓存，添加时间戳强制唯一响应
    return NextResponse.json(
      {
        total_visits: totalVisits,
        _timestamp: Date.now(),  // 强制每次响应唯一
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'ETag': String(Date.now()),  // 强制禁用 ETag 缓存
        },
      }
    );
  } catch (error) {
    console.error('Visit count fetch error:', JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: 'Failed to fetch visit count' },
      { status: 500 }
    );
  }
}
