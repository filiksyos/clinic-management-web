# Clinic Management System

A simple clinic management app that allows receptionists to save data of their patients by helping them add patients and make appointments.

## Features

- Patient management (create, view, edit, delete)
- Appointment scheduling
- User-friendly interface
- Responsive design

## Tech Stack

- Next.js 14
- TypeScript
- Supabase (database)
- TailwindCSS (styling)

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd clinic_new
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a Supabase account at [https://supabase.com/](https://supabase.com/)
2. Create a new project
3. Get your API credentials from the project settings
4. Create a `.env.local` file in the project root with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Set up the database tables

1. Go to the SQL Editor in your Supabase dashboard
2. Copy the contents of the `database-setup.sql` file from this project
3. Paste it into the SQL editor and run the script

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

- `/src/app` - Next.js pages and routes
- `/src/components` - Reusable UI components
- `/src/lib` - Utility functions and Supabase client
- `/public` - Static assets

## Database Schema

### Patients Table
- `id` - UUID (Primary Key)
- `first_name` - Text
- `last_name` - Text
- `gender` - Text (optional)
- `age` - Integer (optional)
- `created_at` - Timestamp
- `updated_at` - Timestamp

### Appointments Table
- `id` - UUID (Primary Key)
- `patient_id` - UUID (Foreign Key)
- `appointment_date` - Timestamp
- `status` - Text (scheduled, completed, cancelled, no-show)
- `notes` - Text (optional)
- `created_at` - Timestamp
- `updated_at` - Timestamp

## License

MIT

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
