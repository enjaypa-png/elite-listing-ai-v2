// Supabase Auth Helper Functions
import { supabase, supabaseAdmin } from './supabase'
import { prisma } from './prisma'

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
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (authError) {
    throw new Error(authError.message)
  }

  if (!authData.user) {
    throw new Error('Failed to create user')
  }

  // Create user record in our Prisma database
  try {
    // Check if user already exists in database
    const existingUser = await prisma.user.findUnique({
      where: { id: authData.user.id }
    })

    if (!existingUser) {
      // Create new user record
      await prisma.user.create({
        data: {
          id: authData.user.id,
          email: authData.user.email!,
          name,
          emailVerified: null, // Will be set when user verifies email
        }
      })

      // Give user 10 free credits (only for new users)
      await prisma.creditLedger.create({
        data: {
          userId: authData.user.id,
          amount: 10,
          balance: 10,
          type: 'bonus',
          description: 'Welcome bonus - 10 free credits',
        }
      })
      
      console.log(`✅ Created new user ${authData.user.email} with 10 welcome credits`)
    } else {
      console.log('User already exists in database, skipping creation')
    }
  } catch (error: any) {
    console.error('Error creating user data:', error)
    // Don't throw - allow signup to succeed even if DB creation fails
    // User can still authenticate
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
  const ledger = await prisma.creditLedger.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { balance: true }
  })

  return ledger?.balance || 0
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

  await prisma.creditLedger.create({
    data: {
      userId,
      amount: -amount,
      balance: newBalance,
      type: 'usage',
      description,
      referenceId,
      referenceType: 'optimization',
    }
  })

  return newBalance
}
