#!/usr/bin/env node

/**
 * Auth User Fix Script
 * 
 * This script helps fix authentication issues when:
 * - User exists in database but not in Supabase Auth
 * - User exists in Supabase Auth but not in database
 * - Credentials mismatch between systems
 * 
 * Usage:
 * node scripts/fix-auth-user.js <email>
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function fixAuthUser(email) {
  console.log(`\n🔍 Checking user: ${email}\n`);

  try {
    // Check if user exists in Supabase Auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error('❌ Failed to list auth users:', authError.message);
      return;
    }

    const authUser = authUsers.users.find((u) => u.email === email);

    // Check if user exists in database
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    console.log('📊 Status:');
    console.log(`   Auth User: ${authUser ? '✅ Exists' : '❌ Not found'}`);
    console.log(`   DB User: ${dbUser ? '✅ Exists' : '❌ Not found'}`);

    if (authUser) {
      console.log(`   Auth User ID: ${authUser.id}`);
      console.log(`   Email Confirmed: ${authUser.email_confirmed_at ? '✅ Yes' : '❌ No'}`);
    }

    if (dbUser) {
      console.log(`   DB User ID: ${dbUser.id}`);
      console.log(`   Credits: ${await getCreditBalance(dbUser.id)}`);
    }

    // Scenarios and fixes
    if (!authUser && !dbUser) {
      console.log('\n✨ User does not exist in either system.');
      console.log('   → Sign up normally to create the user.');
      return;
    }

    if (authUser && !dbUser) {
      console.log('\n🔧 ISSUE: User exists in Auth but not in Database');
      console.log('   Fixing by creating database record...');

      const { error: insertError } = await supabase.from('users').insert({
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.name || 'User',
        emailVerified: authUser.email_confirmed_at ? new Date(authUser.email_confirmed_at) : null,
      });

      if (insertError) {
        console.error('❌ Failed to create DB user:', insertError.message);
        return;
      }

      // Add welcome credits
      const { error: creditError } = await supabase.from('credit_ledgers').insert({
        userId: authUser.id,
        amount: 10,
        balance: 10,
        type: 'bonus',
        description: 'Welcome bonus - 10 free credits',
      });

      if (creditError) {
        console.error('⚠️ Failed to add credits:', creditError.message);
      }

      console.log('✅ Database record created with 10 free credits');
      console.log('   → User can now sign in');
      return;
    }

    if (!authUser && dbUser) {
      console.log('\n🔧 ISSUE: User exists in Database but not in Auth');
      console.log('   This requires creating a new Auth user.');
      console.log('\n   Options:');
      console.log('   1. Delete the DB user and sign up again:');
      console.log(`      → Run: node scripts/fix-auth-user.js --delete ${email}`);
      console.log('   2. Or manually create auth user in Supabase Dashboard');
      return;
    }

    if (authUser && dbUser) {
      if (authUser.id !== dbUser.id) {
        console.log('\n⚠️ WARNING: ID Mismatch!');
        console.log(`   Auth ID: ${authUser.id}`);
        console.log(`   DB ID: ${dbUser.id}`);
        console.log('   This is a critical issue. Contact support.');
        return;
      }

      console.log('\n✅ User is properly synced between Auth and Database');
      console.log('\n   If signin still fails:');
      console.log('   1. Reset password in Supabase Dashboard');
      console.log('   2. Or delete user and sign up again');
      console.log(`      → Run: node scripts/fix-auth-user.js --delete ${email}`);
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

async function deleteUser(email) {
  console.log(`\n🗑️ Deleting user: ${email}\n`);

  try {
    // Check if user exists
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const authUser = authUsers?.users.find((u) => u.email === email);

    if (authUser) {
      // Delete from Auth
      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(authUser.id);

      if (authDeleteError) {
        console.error('❌ Failed to delete auth user:', authDeleteError.message);
      } else {
        console.log('✅ Deleted from Supabase Auth');
      }
    }

    // Delete from database (will cascade to related records)
    const { error: dbDeleteError } = await supabase
      .from('users')
      .delete()
      .eq('email', email);

    if (dbDeleteError) {
      console.error('❌ Failed to delete DB user:', dbDeleteError.message);
    } else {
      console.log('✅ Deleted from Database');
    }

    console.log('\n✨ User deleted. You can now sign up again.');
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

async function getCreditBalance(userId) {
  const { data } = await supabase
    .from('credit_ledgers')
    .select('balance')
    .eq('userId', userId)
    .order('createdAt', { ascending: false })
    .limit(1)
    .single();

  return data?.balance || 0;
}

// Main
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage: node scripts/fix-auth-user.js <email>');
  console.log('       node scripts/fix-auth-user.js --delete <email>');
  process.exit(1);
}

if (args[0] === '--delete' && args[1]) {
  deleteUser(args[1]);
} else {
  fixAuthUser(args[0]);
}
