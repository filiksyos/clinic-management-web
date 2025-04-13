import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Print the DATABASE_URL
console.log('Connection string:', process.env.DATABASE_URL);

// Initialize Prisma client
const prisma = new PrismaClient();

async function testConnection() {
  try {
    // Try to connect to the database
    console.log('Testing database connection...');
    const result = await prisma.$queryRaw`SELECT current_database(), current_user, version()`;
    console.log('Connection successful!');
    console.log('Database info:', result);
    return true;
  } catch (error) {
    console.error('Connection failed:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testConnection()
  .then(success => {
    console.log('Test completed:', success ? 'SUCCESS' : 'FAILED');
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  }); 