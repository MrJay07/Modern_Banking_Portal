import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@123456', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bankingportal.com' },
    update: {},
    create: {
      email: 'admin@bankingportal.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+1234567890',
      role: 'ADMIN',
      kycStatus: 'APPROVED',
    },
  });
  console.log('Admin user created:', admin.email);

  // Create demo user
  const userPassword = await bcrypt.hash('User@123456', 10);
  const user = await prisma.user.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      email: 'john.doe@example.com',
      password: userPassword,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1987654321',
      role: 'USER',
      kycStatus: 'APPROVED',
    },
  });
  console.log('Demo user created:', user.email);

  // Create accounts for demo user
  const checkingAccount = await prisma.account.upsert({
    where: { accountNumber: 'ACC1234567890' },
    update: {},
    create: {
      userId: user.id,
      accountNumber: 'ACC1234567890',
      balance: 15750.50,
      currency: 'USD',
    },
  });

  const savingsAccount = await prisma.account.upsert({
    where: { accountNumber: 'ACC0987654321' },
    update: {},
    create: {
      userId: user.id,
      accountNumber: 'ACC0987654321',
      balance: 42000.00,
      currency: 'USD',
    },
  });
  console.log('Accounts created for demo user');

  // Create admin account
  const adminAccount = await prisma.account.upsert({
    where: { accountNumber: 'ACC1111111111' },
    update: {},
    create: {
      userId: admin.id,
      accountNumber: 'ACC1111111111',
      balance: 100000.00,
      currency: 'USD',
    },
  });

  // Create sample transactions
  const transactions = [
    {
      fromAccountId: adminAccount.id,
      toAccountId: checkingAccount.id,
      senderId: admin.id,
      receiverId: user.id,
      amount: 5000.00,
      type: 'DEPOSIT' as const,
      status: 'COMPLETED' as const,
      description: 'Initial deposit',
    },
    {
      fromAccountId: checkingAccount.id,
      toAccountId: savingsAccount.id,
      senderId: user.id,
      receiverId: user.id,
      amount: 2000.00,
      type: 'TRANSFER' as const,
      status: 'COMPLETED' as const,
      description: 'Transfer to savings',
    },
    {
      fromAccountId: checkingAccount.id,
      toAccountId: null,
      senderId: user.id,
      receiverId: null,
      amount: 500.00,
      type: 'WITHDRAWAL' as const,
      status: 'COMPLETED' as const,
      description: 'ATM withdrawal',
    },
    {
      fromAccountId: adminAccount.id,
      toAccountId: checkingAccount.id,
      senderId: admin.id,
      receiverId: user.id,
      amount: 1250.50,
      type: 'DEPOSIT' as const,
      status: 'COMPLETED' as const,
      description: 'Salary payment',
    },
    {
      fromAccountId: checkingAccount.id,
      toAccountId: null,
      senderId: user.id,
      receiverId: null,
      amount: 150.00,
      type: 'WITHDRAWAL' as const,
      status: 'COMPLETED' as const,
      description: 'Bill payment',
    },
  ];

  for (const tx of transactions) {
    await prisma.transaction.create({ data: tx });
  }
  console.log('Sample transactions created');

  console.log('Database seed completed successfully!');
  console.log('\nDemo credentials:');
  console.log('Admin: admin@bankingportal.com / Admin@123456');
  console.log('User:  john.doe@example.com / User@123456');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
