# Medico Server with Supabase

This is the backend server for the Medico application using Supabase as the database provider.

## Setup Instructions

### Environment Variables

Update the `.env` file with your Supabase credentials:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.yazxyhjlvntshkhfsmhw.supabase.co:5432/postgres
SUPABASE_URL=https://yazxyhjlvntshkhfsmhw.supabase.co
SUPABASE_KEY=YOUR_SUPABASE_KEY
```

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Create database migrations
npm run prisma:migrate

# Seed the database (optional)
npm run seed
```

### Testing the Connection

```bash
# Test the Supabase connection
npm run test:supabase
```

## Database Migration from Railway to Supabase

1. Create Supabase account and project
2. Get database credentials from Supabase
3. Update environment variables
4. Run Prisma migrations to set up the schema
5. Optional: Import data from Railway if needed

## Deployment

The application is deployed on Vercel. Update the following environment variables in your Vercel project:

- `DATABASE_URL`: Supabase PostgreSQL connection string
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_KEY`: Supabase API key

## Architecture

The project uses a hybrid approach:
- **Prisma**: For database ORM and migrations
- **Supabase**: For additional features and direct PostgreSQL access

## Usage

### Accessing Supabase directly

```typescript
import supabase from '../shared/supabase';

// Example query
const { data, error } = await supabase
  .from('users')
  .select('*')
  .limit(10);
```

### Using Prisma (recommended for most operations)

```typescript
import prisma from '../shared/prisma';

// Example query
const users = await prisma.user.findMany({
  take: 10,
});
``` 