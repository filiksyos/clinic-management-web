import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Delete existing data
  await prisma.user.deleteMany({});
  console.log('Existing data deleted');

  // Hash passwords
  const saltRounds = 10;
  const adminPassword = await bcrypt.hash('admin123', saltRounds);
  const receptionistPassword = await bcrypt.hash('receptionist123', saltRounds);
  const doctorPassword = await bcrypt.hash('doctor123', saltRounds);
  const patientPassword = await bcrypt.hash('patient123', saltRounds);

  // Create Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: adminPassword,
      role: UserRole.ADMIN,
      needPasswordChange: false,
      status: UserStatus.ACTIVE
    },
  });

  // Create Receptionist User
  const receptionistUser = await prisma.user.create({
    data: {
      email: 'receptionist@example.com',
      password: receptionistPassword,
      role: UserRole.RECEPTIONIST,
      needPasswordChange: false,
      status: UserStatus.ACTIVE
    },
  });

  // Create Doctor User
  const doctorUser = await prisma.user.create({
    data: {
      email: 'doctor@example.com',
      password: doctorPassword,
      role: UserRole.DOCTOR,
      needPasswordChange: false,
      status: UserStatus.ACTIVE
    },
  });

  // Create Patient User
  const patientUser = await prisma.user.create({
    data: {
      email: 'patient@example.com',
      password: patientPassword,
      role: UserRole.PATIENT,
      needPasswordChange: false,
      status: UserStatus.ACTIVE
    },
  });

  console.log('Seed data created successfully');
  console.log('Default login credentials:');
  console.log('Admin: email=admin@example.com, password=admin123');
  console.log('Receptionist: email=receptionist@example.com, password=receptionist123');
  console.log('Doctor: email=doctor@example.com, password=doctor123');
  console.log('Patient: email=patient@example.com, password=patient123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 