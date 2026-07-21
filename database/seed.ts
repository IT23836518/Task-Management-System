import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@test.com';
  
  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (existingAdmin) {
    console.log('Admin user already exists in the database.');
    return;
  }

  // Hash password "123456"
  const hashedPassword = await bcrypt.hash('123456', 10);

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      name: 'Administrator',
      email: adminEmail,
      password: hashedPassword
    }
  });

  console.log(`Successfully seeded admin user: ${adminUser.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
