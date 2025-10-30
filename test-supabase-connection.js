// Test Supabase connection
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testConnection() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('Testing Supabase connection...');
  console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  
  try {
    // Try to query the users table
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      
      // Check if table doesn't exist
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('\n✅ Connection successful! But tables don\'t exist yet.');
        console.log('📝 We need to create the database schema.');
        return true;
      }
      return false;
    }
    
    console.log('✅ Connection successful!', data);
    return true;
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return false;
  }
}

testConnection().then(success => {
  process.exit(success ? 0 : 1);
});
