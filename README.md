# Salary Navigator

Track your salary progression against compensation bands, surface year-over-year insights, and keep a clean ledger of updates.

## Features

- 📈 **Rich visualizations** – Line and area charts show salary vs. band and YoY trends in a dark, mobile-first layout.
- 🧮 **Actionable metrics** – Automatic summaries for growth, YoY deltas, compa ratio, and more.
- 🗂️ **Supabase-backed storage** – Persist entries for each role/year with room to append new data over time.
- 📝 **In-app editing** – Add new salary entries directly through the interface.

## Getting started

### 1. Configure environment variables

Create a `.env.local` file with your Supabase project credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

> ℹ️ `NEXT_PUBLIC_SUPABASE_ANON_KEY` is used for all Supabase requests.

### 2. Create the storage table

Run the following SQL in Supabase (SQL Editor → New query) to create the table used by the app:

```sql
create table if not exists public.salary_history (
  id uuid default gen_random_uuid() primary key,
  role text not null,
  year integer not null check (year between 1900 and 2100),
  salary numeric not null check (salary > 0),
  range_min numeric check (range_min > 0),
  range_mid numeric not null check (range_mid > 0),
  range_max numeric check (range_max > 0),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists salary_history_year_idx on public.salary_history (year asc);
```

Grant anonymous access (if desired) by updating policies to allow the anon key to read and insert salary history records.

### 3. Install dependencies and run locally

```bash
npm install
npm run dev
```

Visit http://localhost:3000 to interact with the dashboard.

## Project structure

```
app/
  api/salaries/route.ts   # Supabase-backed API route for CRUD operations
  page.tsx                # Client dashboard with charts, metrics, and data table
  layout.tsx              # Global HTML structure and metadata
  globals.css             # Base styles + dark theme
components/               # Reusable UI blocks (forms, charts, metrics, etc.)
lib/supabaseAdmin.ts      # Server-side Supabase client using anon key
types/salary.ts           # Shared TypeScript contracts
utils/metrics.ts          # Derived analytics helpers
```

## Next steps

- Authentication/authorization for multi-user access.
- Editing & deleting entries.
- Support for multiple roles or currencies.
