
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
  password text, -- Added for student login
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: workout_plans
create table public.workout_plans (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.students(id) on delete cascade,
  title text not null,
  content jsonb, -- Stores the entire workout structure (sessions/exercises) as JSON
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: assessments (Avaliações Físicas)
create table public.assessments (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.students(id) on delete cascade,
  date date not null,
  weight numeric,
  body_fat numeric,
  muscle_mass numeric,
  visceral_fat numeric,
  metabolic_age numeric,
  
  -- Medidas
  chest numeric,
  arms numeric,
  waist numeric,
  abdomen numeric,
  hips numeric,
  thighs numeric,
  calves numeric,
  
  -- Relatórios IA
  strategic_report text,
  motivational_report text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
*/
export const SCHEMA_INFO = "See file content for SQL definitions";
