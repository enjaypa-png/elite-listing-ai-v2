export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchAnalysisHistory } from '@/lib/image-analysis-rpc';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function GET(request: NextRequest) {
  try {
    // Get query params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const cursor = searchParams.get('cursor') || undefined;
    
    // Get auth token
    const authHeader = request.headers.get('Authorization');
    const accessToken = authHeader?.replace('Bearer ', '');
    
    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }
    
    // Create authenticated client
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    
    // Verify token
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token', code: 'AUTH_INVALID' },
        { status: 401 }
      );
    }
    
    console.log('[History] Fetching for user:', user.id, 'limit:', limit, 'cursor:', cursor);
    
    // Fetch history via RPC
    const { data, error } = await fetchAnalysisHistory(supabase, limit, cursor);
    
    if (error) {
      console.error('[History] RPC error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch history', details: error },
        { status: 500 }
      );
    }
    
    // Get next cursor (last item's created_at)
    const nextCursor = data && data.length > 0 
      ? data[data.length - 1].created_at 
      : null;
    
    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0,
      nextCursor,
      hasMore: data?.length === limit,
    });
    
  } catch (error: any) {
    console.error('[History] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal error' },
      { status: 500 }
    );
  }
}
