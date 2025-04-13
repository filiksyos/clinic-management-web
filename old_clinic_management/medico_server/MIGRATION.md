# Migrating from Railway to Supabase

This document outlines the steps to migrate the Medico Server from Railway PostgreSQL to Supabase.

## Prerequisites

1. A Supabase account and project
2. Access to the current Railway database (optional, for data migration)
3. Node.js and npm installed

## Step 1: Set Up Supabase Project

1. Create a new Supabase project at https://app.supabase.com
2. Note your project URL and API key
3. Get the PostgreSQL connection details from the "Settings" > "Database" section

## Step 2: Update Environment Variables

Update your `.env` file with the Supabase credentials:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.yazxyhjlvntshkhfsmhw.supabase.co:5432/postgres
SUPABASE_URL=https://yazxyhjlvntshkhfsmhw.supabase.co
SUPABASE_KEY=YOUR_SUPABASE_KEY
```

## Step 3: Install Dependencies

```bash
npm install @supabase/supabase-js
```

## Step 4: Run Database Migrations

```bash
npm run prisma:generate
npm run prisma:migrate
```

## Step 5: Test the Connection

```bash
npm run test:supabase
```

## Step 6: Data Migration (Optional)

If you need to migrate data from Railway to Supabase:

### Option 1: Using Prisma Seed

1. Export data from Railway
2. Update the seed file with the exported data
3. Run `npm run seed`

### Option 2: Direct Database Import

1. Export data from Railway as SQL or CSV
2. Import into Supabase using SQL Editor or pgAdmin

## Step 7: Update Deployment Configuration

Update your Vercel environment variables:

1. `DATABASE_URL`: Supabase PostgreSQL connection string
2. `SUPABASE_URL`: Supabase project URL
3. `SUPABASE_KEY`: Supabase API key

## Step 8: Deploy and Test

1. Deploy the application
2. Test all functionality in the production environment

## Troubleshooting

### Connection Issues

- Verify the database password is correct
- Check if the IP is whitelisted in Supabase
- Ensure the database is publicly accessible

### Migration Errors

- Make sure the Prisma schema is compatible with PostgreSQL
- Check for any Railway-specific PostgreSQL features that might not be supported in Supabase

## Rollback Plan

If migration fails:

1. Revert the environment variables to Railway
2. Redeploy the application

# Schema Migration Guide: Simplifying Role System

This document outlines the steps to migrate the database schema from the complex role-based system to a simplified admin-only system.

## Overview of Changes

1. **Removed User Model**: The User model has been removed, and authentication is now handled directly by the Admin model.

2. **Simplified Role System**: The roles (Doctor, Patient, Receptionist) are now simple objects created by Admins, not separate user accounts.

3. **Removed Complex Relationships**: Removed many-to-many relationships, unnecessary enums, and complex data models.

4. **Optional Fields**: Most fields in Doctor, Patient, and Receptionist models are now optional, requiring only firstName and lastName.

## Steps to Migrate

### 1. Create Database Backup

```bash
# If using PostgreSQL directly
pg_dump -U postgres -h localhost -d your_db_name > backup.sql

# If using Supabase
# Use the Supabase dashboard to create a backup
```

### 2. Update Schema

The schema has been updated to the following structure:

```prisma
model Admin {
  id                 String         @id @default(uuid())
  email              String         @unique
  password           String
  firstName          String
  lastName           String
  profilePhoto       String?
  contactNumber      String
  address            String?
  isDeleted          Boolean        @default(false)
  createdAt          DateTime       @default(now())
  updatedAt          DateTime       @updatedAt
  status             UserStatus     @default(ACTIVE)
  needPasswordChange Boolean        @default(true)
  doctors            Doctor[]
  patients           Patient[]
  receptionists      Receptionist[]
}

model Doctor {
  id                  String   @id @default(uuid())
  firstName           String
  lastName            String
  profilePhoto        String?
  contactNumber       String?
  address             String?
  registrationNumber  String?
  experience          Int?     @default(0)
  qualification       String?
  currentWorkingPlace String?
  designation         String?
  isDeleted           Boolean  @default(false)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  adminId             String
  admin               Admin    @relation(fields: [adminId], references: [id])
}

model Patient {
  id            String   @id @default(uuid())
  firstName     String
  lastName      String
  profilePhoto  String?
  contactNumber String?
  address       String?
  isDeleted     Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  adminId       String
  admin         Admin    @relation(fields: [adminId], references: [id])
}

model Receptionist {
  id            String   @id @default(uuid())
  firstName     String
  lastName      String
  profilePhoto  String?
  contactNumber String?
  address       String?
  isDeleted     Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  adminId       String
  admin         Admin    @relation(fields: [adminId], references: [id])
}
```

### 3. Data Migration Process

#### 3.1. Migrate Admin Accounts

1. For each admin record in the old schema:
   - Create a new admin record in the new schema
   - Copy admin data (firstName, lastName, etc.)
   - Move password and authentication details from User to Admin

#### 3.2. Convert Doctors, Patients, and Receptionists

1. For each doctor/patient/receptionist record in the old schema:
   - Create a new record in the appropriate table
   - Copy basic data (firstName, lastName, etc.)
   - Assign to an admin (typically the first admin in the system)
   - Only copy essential fields

### 4. Update Code

1. Update authentication services to work with Admin model
2. Update services for Doctor, Patient, and Receptionist
3. Remove all services related to now-removed models

### 5. Testing

1. Test Admin authentication
2. Test CRUD operations for Doctors, Patients, and Receptionists
3. Verify that Admins can manage all three entity types

## Rollback Plan

If the migration doesn't work as expected:

1. **Restore Database Backup**:
   ```sql
   -- Drop migrated tables
   DROP TABLE IF EXISTS "doctors", "patients", "receptionists", "admins" CASCADE;
   
   -- Restore from backup
   ```

2. **Revert Code Changes**:
   ```bash
   git checkout [previous-commit]
   ```

## Post-Migration Cleanup

After confirming everything works correctly:

1. Remove any unused code related to the old schema
2. Update documentation
3. Archive old model definitions for reference 