import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function getCurrentUser(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return null;
    }
    
    return session.user;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

export async function requireAuth(request: NextRequest) {
  const user = await getCurrentUser(request);
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  return user;
}
