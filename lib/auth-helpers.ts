// Supabase Auth Helper Functions
import { supabase, supabaseAdmin } from './supabase'

export interface SignUpData {
  email: string
  password: string
  name: string
}

export interface SignInData {
  email: string
  password: string
}

/**
 * Sign up a new user with email and password
 */
export async function signUp({ email, password, name }: SignUpData) {
  // Create auth user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name, // Store name in auth metadata
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (authError) {
    throw new Error(authError.message)
  }

  if (!authData.user) {
    throw new Error('Failed to create user')
  }

  // Create user record in our database
  try {
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email: authData.user.email!,
        name,
        emailVerified: null, // Will be set when user verifies email
      })

    if (dbError) {
      console.error('Failed to create user record:', dbError)
      // Don't throw - auth user is already created
    }

    // Give user 10 free credits
    await supabaseAdmin.from('credit_ledgers').insert({
      userId: authData.user.id,
      amount: 10,
      balance: 10,
      type: 'bonus',
      description: 'Welcome bonus - 10 free credits',
    })
  } catch (error) {
    console.error('Error creating user data:', error)
  }

  return {
    user: authData.user,
    session: authData.session,
  }
}

/**
 * Sign in with email and password
 */
export async function signIn({ email, password }: SignInData) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  return {
    user: data.user,
    session: data.session,
  }
}

/**
 * Sign out current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    throw new Error(error.message)
  }
}

/**
 * Get current user session
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data.session
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    throw new Error(error.message)
  }
  
  return user
}

/**
 * Get user's credit balance
 */
export async function getCreditBalance(userId: string): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from('credit_ledgers')
    .select('balance')
    .eq('userId', userId)
    .order('createdAt', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    console.error('Error fetching credit balance:', error)
    return 0
  }

  return data?.balance || 0
}

/**
 * Deduct credits from user's balance
 */
export async function deductCredits(userId: string, amount: number, description: string, referenceId?: string) {
  // Get current balance
  const currentBalance = await getCreditBalance(userId)

  if (currentBalance < amount) {
    throw new Error('Insufficient credits')
  }

  // Deduct credits
  const newBalance = currentBalance - amount

  const { error } = await supabaseAdmin.from('credit_ledgers').insert({
    userId,
    amount: -amount,
    balance: newBalance,
    type: 'usage',
    description,
    referenceId,
    referenceType: 'optimization',
  })

  if (error) {
    throw new Error('Failed to deduct credits')
  }

  return newBalance
}
