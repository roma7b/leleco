/**
 * SUPABASE SQL SCHEMA DEFINITION
 * 
 * Execute this in the Supabase SQL Editor to set up the database.
 */

/*
-- Table: students
create table public.students (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  avatar_url text,
  status text check (status in ('Pago', 'Atrasado', 'Pendente')),
  goal text,
  last_payment_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: workout_plans
create table public.workout_plans (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.students(id) on delete cascade,
  title text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: workout_sessions (e.g., Treino A, Treino B)
create table public.workout_sessions (
  id uuid default gen_random_uuid() primary key,
  plan_id uuid references public.workout_plans(id) on delete cascade,
  name text not null, -- e.g., "Treino A"
  order_index integer default 0
);

-- Table: exercises
create table public.exercises (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.workout_sessions(id) on delete cascade,
  name text not null,
  sets integer,
  reps text,
  weight text,
  rest text,
  video_url text, -- Stores YouTube/Vimeo/Drive link
  notes text,
  order_index integer default 0
);
*/
export const SCHEMA_INFO = "See file content for SQL definitions";