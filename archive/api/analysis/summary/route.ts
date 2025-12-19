export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchUserSummary } from '@/lib/image-analysis-rpc';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function GET(request: NextRequest) {
  try {
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
    
    console.log('[Summary] Fetching 30-day summary for user:', user.id);
    
    // Fetch summary via RPC
    const { data, error } = await fetchUserSummary(supabase);
    
    if (error) {
      console.error('[Summary] RPC error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch summary', details: error },
        { status: 500 }
      );
    }
    
    // Calculate totals
    const totals = data?.reduce((acc, day) => ({
      totalAnalyses: acc.totalAnalyses + (day.analyses_count || 0),
      avgScore: 0, // Calculate below
      maxScore: Math.max(acc.maxScore, day.max_score || 0),
      minScore: Math.min(acc.minScore, day.min_score || 100),
    }), { totalAnalyses: 0, avgScore: 0, maxScore: 0, minScore: 100 });
    
    // Calculate weighted average
    if (totals && data && data.length > 0) {
      const weightedSum = data.reduce((sum, day) => 
        sum + (day.avg_score || 0) * (day.analyses_count || 0), 0);
      totals.avgScore = totals.totalAnalyses > 0 
        ? Math.round(weightedSum / totals.totalAnalyses) 
        : 0;
    }
    
    return NextResponse.json({
      success: true,
      days: data || [],
      totals,
      period: '30 days',
    });
    
  } catch (error: any) {
    console.error('[Summary] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal error' },
      { status: 500 }
    );
  }
}
