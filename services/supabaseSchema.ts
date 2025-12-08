/**
 * SUPABASE SQL SCHEMA DEFINITION
 * 
 * Execute this in the Supabase SQL Editor to set up the database.
 */

/*
-- Table: students
create table if not exists public.students (
  id uuid default gen_random_uuid() primary key,
  trainer_id text, -- ID do Personal (Multi-tenant)
  name text not null,
  email text,
  avatar_url text,
  status text check (status in ('Pago', 'Atrasado', 'Pendente')),
  goal text,
  last_payment_date date,
  password text, -- Added for student login
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: workout_plans
create table if not exists public.workout_plans (
  id uuid default gen_random_uuid() primary key,
  trainer_id text,
  student_id uuid references public.students(id) on delete cascade,
  title text not null,
  content jsonb, 
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: workouts (Alias para workout_plans se o código usar esse nome)
create table if not exists public.workouts (
  id uuid default gen_random_uuid() primary key,
  trainer_id text,
  student_id uuid references public.students(id) on delete cascade,
  title text not null,
  content jsonb, 
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: assessments (Avaliações Físicas)
create table if not exists public.assessments (
  id uuid default gen_random_uuid() primary key,
  trainer_id text,
  student_id uuid references public.students(id) on delete cascade,
  date date not null,
  
  -- Biometria e Metodologia
  age numeric,
  height numeric,
  imc numeric,
  fat_method text,
  tmb_method text,

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

  -- Dobras Cutâneas (mm)
  sf_chest numeric,
  sf_axillary numeric,
  sf_triceps numeric,
  sf_subscapular numeric,
  sf_abdominal numeric,
  sf_suprailiac numeric,
  sf_thigh numeric,
  
  -- Relatórios IA
  strategic_report text,
  motivational_report text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Desabilitar RLS para evitar erros de permissão iniciais
alter table public.students disable row level security;
alter table public.workouts disable row level security;
alter table public.assessments disable row level security;
*/
export const SCHEMA_INFO = "See file content for SQL definitions";