/**
 * SUPABASE SQL SCHEMA - SILVER BULLET FIX
 * 
 * ESTRATÉGIA: MUDANÇA DE NOME DA TABELA
 * O erro PGRST204 ocorre porque o Supabase travou no cache da tabela 'assessments'.
 * Vamos criar uma tabela nova chamada 'student_assessments'. O cache não existe para ela,
 * então vai funcionar de primeira.
 * 
 * INSTRUÇÕES:
 * 1. Copie e cole no SQL Editor.
 * 2. Clique em RUN.
 */

export const SUPABASE_SQL_SCRIPT = `
-- 1. Cria a tabela nova com nome diferente para driblar o cache
CREATE TABLE IF NOT EXISTS public.student_assessments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now(),
    date timestamp with time zone DEFAULT now(),
    
    student_id text NOT NULL,
    trainer_id text NOT NULL,
    
    -- Biometria
    age numeric,
    height numeric,
    imc numeric,
    weight numeric,
    
    -- Metodologia
    fat_method text,
    tmb_method text,
    
    -- Composição
    body_fat numeric,
    muscle_mass numeric,
    visceral_fat numeric,
    metabolic_age numeric,
    
    -- Medidas Centrais
    chest numeric,
    waist numeric,
    abdomen numeric,
    hips numeric,
    
    -- Medidas Bilaterais (Novas)
    arm_right numeric DEFAULT 0,
    arm_left numeric DEFAULT 0,
    thigh_right numeric DEFAULT 0,
    thigh_left numeric DEFAULT 0,
    calf_right numeric DEFAULT 0,
    calf_left numeric DEFAULT 0,
    
    -- Dobras
    sf_chest numeric,
    sf_axillary numeric,
    sf_triceps numeric,
    sf_subscapular numeric,
    sf_abdominal numeric,
    sf_suprailiac numeric,
    sf_thigh numeric,

    -- Extras
    photo_urls jsonb DEFAULT '{}'::jsonb,
    strategic_report text,
    motivational_report text
);

-- 2. Habilita segurança na tabela nova
ALTER TABLE public.student_assessments ENABLE ROW LEVEL SECURITY;

-- 3. Cria política de acesso total (Leitura/Escrita) para todos (Dev Mode)
DROP POLICY IF EXISTS "Acesso Total Nova Tabela" ON public.student_assessments;
CREATE POLICY "Acesso Total Nova Tabela" 
ON public.student_assessments 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 4. Notifica o PostgREST para reconhecer a nova tabela imediatamente
NOTIFY pgrst, 'reload config';

-- 5. ATUALIZAÇÃO FINANCEIRA (Adiciona colunas na tabela students se não existirem)
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS payment_link text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS due_day numeric DEFAULT 10;

-- FIM DO SCRIPT
`;
