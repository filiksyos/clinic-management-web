-- Create enums
CREATE TYPE "UserStatus" AS ENUM ('BLOCKED', 'ACTIVE', 'PENDING', 'DELETED');

-- Create Admin table
CREATE TABLE "admins" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "email" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "profilePhoto" TEXT,
  "contactNumber" TEXT NOT NULL,
  "address" TEXT,
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
  "needPasswordChange" BOOLEAN NOT NULL DEFAULT true,
  
  CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- Create Doctor table
CREATE TABLE "doctors" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "profilePhoto" TEXT,
  "contactNumber" TEXT,
  "address" TEXT,
  "registrationNumber" TEXT,
  "experience" INTEGER,
  "qualification" TEXT,
  "currentWorkingPlace" TEXT,
  "designation" TEXT,
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "adminId" UUID NOT NULL,
  
  CONSTRAINT "doctors_pkey" PRIMARY KEY ("id")
);

-- Create Patient table
CREATE TABLE "patients" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "profilePhoto" TEXT,
  "contactNumber" TEXT,
  "address" TEXT,
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "adminId" UUID NOT NULL,
  
  CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- Create Receptionist table
CREATE TABLE "receptionists" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "profilePhoto" TEXT,
  "contactNumber" TEXT,
  "address" TEXT,
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "adminId" UUID NOT NULL,
  
  CONSTRAINT "receptionists_pkey" PRIMARY KEY ("id")
);

-- Add unique constraints
ALTER TABLE "admins" ADD CONSTRAINT "admins_email_key" UNIQUE ("email");

-- Add foreign keys
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "patients" ADD CONSTRAINT "patients_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "receptionists" ADD CONSTRAINT "receptionists_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;