import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';

// Load environment variables
dotenv.config();

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnections() {
  console.log('Testing database connections...');

  // Test Prisma connection
  try {
    const userCount = await prisma.user.count();
    console.log(`✅ Prisma connection successful! Found ${userCount} users.`);
  } catch (error) {
    console.error('❌ Prisma connection failed:', error);
  }

  // Test Supabase connection
  try {
    const { data, error } = await supabase.from('users').select('*').limit(1);
    
    if (error) throw error;
    
    console.log('✅ Supabase connection successful!');
    console.log('Supabase data:', data);
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
  }

  // Close connections
  await prisma.$disconnect();
}

// Run the test
testConnections()
  .catch(console.error)
  .finally(() => {
    console.log('Test completed.');
  }); 