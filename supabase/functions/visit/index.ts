/**
 * Supabase Edge Function - 访客统计
 * 
 * 功能：
 * 1. GET /: 查询总访问量
 * 2. POST /: 记录一次新访问
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// CORS 配置
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req) => {
  // 处理 CORS 预检请求
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // GET 请求：查询总访问量
    if (req.method === 'GET') {
      const response = await fetch(`${supabaseUrl}/rest/v1/visits?select=count`, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch visit count');
      }

      const data = await response.json();
      const count = data[0]?.count || 0;

      return new Response(
        JSON.stringify({ count }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // POST 请求：记录新访问
    if (req.method === 'POST') {
      const { path } = await req.json().catch(() => ({}));

      const response = await fetch(`${supabaseUrl}/rest/v1/visits`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          path: path || '/',
          user_agent: req.headers.get('user-agent') || '',
          ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to record visit');
      }

      return new Response(
        JSON.stringify({ success: true }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
