import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash passwords
  const adminPasswordHash = await bcrypt.hash('Mayflower1!!', 10);
  const userPasswordHash = await bcrypt.hash('Mayflower1!', 10);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'brain@admin.com' },
    update: {
      password: adminPasswordHash,
      role: 'admin',
      name: 'Brain Admin',
    },
    create: {
      email: 'brain@admin.com',
      name: 'Brain Admin',
      password: adminPasswordHash,
      role: 'admin',
    },
  });

  console.log('✅ Created admin user:', admin.email);

  // Create test user
  const testUser = await prisma.user.upsert({
    where: { email: 'testaccount1@test.com' },
    update: {
      password: userPasswordHash,
      role: 'user',
      name: 'Test Account 1',
    },
    create: {
      email: 'testaccount1@test.com',
      name: 'Test Account 1',
      password: userPasswordHash,
      role: 'user',
    },
  });

  console.log('✅ Created test user:', testUser.email);

  // Create some default trading pairs
  const tradingPairs = [
    { symbol: 'BTCUSD', name: 'Bitcoin', market: 'crypto' },
    { symbol: 'ETHUSD', name: 'Ethereum', market: 'crypto' },
    { symbol: 'AAPL', name: 'Apple Inc.', market: 'stock' },
    { symbol: 'TSLA', name: 'Tesla Inc.', market: 'stock' },
    { symbol: 'EURUSD', name: 'Euro/US Dollar', market: 'forex' },
  ];

  for (const pair of tradingPairs) {
    await prisma.tradingPair.upsert({
      where: { symbol: pair.symbol },
      update: { ...pair, isActive: true },
      create: pair,
    });
  }

  console.log('✅ Created default trading pairs');
  console.log('\n📋 Default Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin:');
  console.log('  Email: brain@admin.com');
  console.log('  Password: Mayflower1!!');
  console.log('\nTest User:');
  console.log('  Email: testaccount1@test.com');
  console.log('  Password: Mayflower1!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
