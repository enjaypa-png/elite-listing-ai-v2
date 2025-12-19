/**
 * Authentication Guard for API Routes
 * Extracts user from Supabase session and enforces auth
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

export interface AuthResult {
  user: AuthUser | null;
  error: string | null;
  supabase: ReturnType<typeof createClient> | null;
}

/**
 * Get authenticated user from request
 * Returns user info and an authenticated Supabase client
 */
export async function getAuthUser(request: NextRequest): Promise<AuthResult> {
  try {
    // Get the access token from Authorization header or cookies
    const authHeader = request.headers.get('Authorization');
    const accessToken = authHeader?.replace('Bearer ', '');
    
    // Also check for Supabase auth cookies
    const cookies = request.cookies;
    const sbAccessToken = cookies.get('sb-access-token')?.value;
    const sbRefreshToken = cookies.get('sb-refresh-token')?.value;
    
    // Create a Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    
    // Try to get user from access token
    if (accessToken || sbAccessToken) {
      const token = accessToken || sbAccessToken;
      
      // Set the session
      if (token && sbRefreshToken) {
        await supabase.auth.setSession({
          access_token: token,
          refresh_token: sbRefreshToken,
        });
      }
      
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (user && !error) {
        return {
          user: {
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.name,
          },
          error: null,
          supabase,
        };
      }
    }
    
    // Try to get session from cookies
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (session?.user && !sessionError) {
      return {
        user: {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name,
        },
        error: null,
        supabase,
      };
    }
    
    return {
      user: null,
      error: 'No valid session found',
      supabase: null,
    };
    
  } catch (error: any) {
    console.error('[Auth Guard] Error:', error);
    return {
      user: null,
      error: error.message || 'Authentication failed',
      supabase: null,
    };
  }
}

/**
 * Require authentication - returns 401 if not authenticated
 */
export async function requireAuth(request: NextRequest): Promise<{
  user: AuthUser;
  supabase: ReturnType<typeof createClient>;
} | NextResponse> {
  const { user, error, supabase } = await getAuthUser(request);
  
  if (!user || !supabase) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Authentication required',
        details: error,
        code: 'AUTH_REQUIRED'
      },
      { status: 401 }
    );
  }
  
  return { user, supabase };
}
