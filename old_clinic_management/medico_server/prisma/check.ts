import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking database contents...\n');

  // Check Users
  const users = await prisma.user.findMany();
  console.log('Users:', users.length);
  users.forEach(user => {
    console.log(`- ${user.email} (${user.role})`);
  });

  // Check Admins
  const admins = await prisma.admin.findMany();
  console.log('\nAdmins:', admins.length);
  admins.forEach(admin => {
    console.log(`- ${admin.email}`);
  });

  // Check Receptionists
  const receptionists = await prisma.receptionist.findMany();
  console.log('\nReceptionists:', receptionists.length);
  receptionists.forEach(receptionist => {
    console.log(`- ${receptionist.email}`);
  });

  // Check Doctors
  const doctors = await prisma.doctor.findMany();
  console.log('\nDoctors:', doctors.length);
  doctors.forEach(doctor => {
    console.log(`- ${doctor.email}`);
  });

  // Check Patients
  const patients = await prisma.patient.findMany();
  console.log('\nPatients:', patients.length);
  patients.forEach(patient => {
    console.log(`- ${patient.email}`);
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 