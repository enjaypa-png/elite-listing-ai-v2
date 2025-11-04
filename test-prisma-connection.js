#!/usr/bin/env node

// Test what database Prisma is actually connecting to
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: './elite-listing-ai-v2/.env.local' });

async function testPrismaConnection() {
  console.log('='.repeat(60));
  console.log('Prisma Database Connection Test');
  console.log('='.repeat(60));
  
  // Check environment variables
  console.log('Environment Variables:');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
  if (process.env.DATABASE_URL) {
    // Show just the protocol and host, not the full URL with credentials
    const url = new URL(process.env.DATABASE_URL);
    console.log('Database Type:', url.protocol.replace(':', ''));
    console.log('Database Host:', url.hostname);
    console.log('Database Port:', url.port);
    console.log('Database Name:', url.pathname.replace('/', ''));
  }
  console.log('');
  
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });
  
  try {
    console.log('Testing Prisma connection...');
    
    // Try to connect and run a simple query
    await prisma.$connect();
    console.log('✅ Prisma connected successfully');
    
    // Try to query the database
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database query successful:', result);
    
    // Check if we can access the User table
    try {
      const userCount = await prisma.user.count();
      console.log('✅ User table accessible, count:', userCount);
    } catch (error) {
      console.log('⚠️  User table query failed:', error.message);
      
      // Check if it's a table doesn't exist error
      if (error.message.includes('does not exist') || error.message.includes('no such table')) {
        console.log('📝 This suggests the database schema hasn\'t been created yet');
      }
    }
    
  } catch (error) {
    console.error('❌ Prisma connection failed:', error.message);
    
    // Check for specific error types
    if (error.message.includes('Can\'t reach database server')) {
      console.log('🔍 This is a network connectivity issue');
      console.log('   The database server is not reachable');
    } else if (error.message.includes('authentication failed')) {
      console.log('🔍 This is an authentication issue');
      console.log('   Check your database credentials');
    } else if (error.message.includes('database does not exist')) {
      console.log('🔍 The database doesn\'t exist');
      console.log('   You may need to create the database first');
    }
    
    return false;
  } finally {
    await prisma.$disconnect();
  }
  
  return true;
}

// Run the test
testPrismaConnection()
  .then(success => {
    console.log('');
    console.log('='.repeat(60));
    if (success) {
      console.log('🎉 Database connection test completed successfully');
    } else {
      console.log('❌ Database connection test failed');
    }
    console.log('='.repeat(60));
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });