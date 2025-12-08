import { supabase } from './supabase';
import { Student, WorkoutPlan, PaymentStatus, Assessment } from '../types';

// --- ALUNOS ---

export const fetchStudents = async (trainerId: string): Promise<Student[]> => {
  if (!trainerId) return [];

  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('trainer_id', trainerId) // Filtra pelo Treinador Logado
    .order('name');

  if (error) {
    console.error('Erro ao buscar alunos:', error);
    return [];
  }

  // Mapear snake_case do banco para camelCase do TypeScript
  return data.map((s: any) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    avatarUrl: s.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=random&color=fff`,
    status: s.status as PaymentStatus,
    goal: s.goal,
    lastPaymentDate: s.last_payment_date,
    password: s.password, // Recuperando a senha para verificação de login
  }));
};

export const createStudent = async (student: Student, trainerId: string): Promise<Student | null> => {
  const { data, error } = await supabase
    .from('students')
    .insert([
      {
        trainer_id: trainerId, // Vincula ao Treinador
        name: student.name,
        email: student.email,
        avatar_url: student.avatarUrl,
        status: student.status,
        goal: student.goal,
        last_payment_date: student.lastPaymentDate,
        password: student.password, 
      },
    ])
    .select()
    .single();

  if (error) {
    // Tratamento de erro específico para Email Duplicado (Postgres Error 23505)
    if (error.code === '23505') {
        if (typeof window !== 'undefined') {
            alert(`O email "${student.email}" já está cadastrado no sistema. Use outro email ou edite o aluno existente.`);
        }
    } else {
        if (typeof window !== 'undefined') {
            alert(`Erro ao criar aluno: ${error.message}`);
        }
    }
    console.error('Erro ao criar aluno:', error);
    return null;
  }

  return {
    ...student,
    id: data.id, 
  };
};

export const updateStudent = async (student: Student): Promise<boolean> => {
  const updateData: any = {
      status: student.status,
      goal: student.goal,
      last_payment_date: student.lastPaymentDate,
      name: student.name,
      email: student.email
  };

  if (student.password && student.password.trim() !== '') {
      updateData.password = student.password;
  }

  const { error } = await supabase
    .from('students')
    .update(updateData)
    .eq('id', student.id);

  if (error) {
    console.error('Erro ao atualizar aluno:', error);
    if (typeof window !== 'undefined') alert(`Erro ao atualizar: ${error.message}`);
    return false;
  }
  return true;
};

// --- TREINOS ---

export const fetchWorkouts = async (trainerId: string): Promise<WorkoutPlan[]> => {
  if (!trainerId) return [];

  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('trainer_id', trainerId); // Filtra pelo Treinador

  if (error) {
    console.error('Erro ao buscar treinos:', error);
    return [];
  }

  return data.map((w: any) => ({
    id: w.id,
    studentId: w.student_id,
    title: w.title,
    createdAt: w.created_at,
    sessions: w.content // O JSON salva a estrutura completa
  }));
};

export const createWorkout = async (workout: WorkoutPlan, trainerId: string): Promise<WorkoutPlan | null> => {
  const { data, error } = await supabase
    .from('workouts')
    .insert([
      {
        trainer_id: trainerId, // Vincula ao Treinador
        student_id: workout.studentId,
        title: workout.title,
        content: workout.sessions, 
        created_at: workout.createdAt
      },
    ])
    .select()
    .single();

  if (error) {
    if (typeof window !== 'undefined') {
        alert(`Erro ao salvar treino: ${error.message}`);
    }
    console.error('Erro ao salvar treino:', error);
    return null;
  }

  return {
    ...workout,
    id: data.id
  };
};

// --- AVALIAÇÕES ---

export const fetchAssessments = async (studentId?: string, trainerId?: string): Promise<Assessment[]> => {
  let query = supabase.from('assessments').select('*').order('date', { ascending: false });
  
  // Se tiver studentId, foca nele (Prioridade para visão do aluno ou detalhe do aluno)
  if (studentId) {
    query = query.eq('student_id', studentId);
  } 
  // Se não tiver studentId mas tiver trainerId, pega todas do treinador (Visão Dashboard Geral)
  else if (trainerId) {
    query = query.eq('trainer_id', trainerId);
  } else {
    // Se não passar nenhum, retorna vazio por segurança em multi-tenant
    return [];
  }

  const { data, error } = await query;

  if (error) {
    console.error('Erro ao buscar avaliações:', error);
    return [];
  }

  return data.map((a: any) => ({
    id: a.id,
    studentId: a.student_id,
    date: a.date,
    
    // Biometria
    age: a.age,
    height: a.height,
    imc: a.imc,
    fatCalculationMethod: a.fat_method,
    tmbFormula: a.tmb_method,

    weight: a.weight,
    bodyFat: a.body_fat,
    muscleMass: a.muscle_mass,
    visceralFat: a.visceral_fat,
    metabolicAge: a.metabolic_age,
    
    // Medidas
    chest: a.chest,
    arms: a.arms,
    waist: a.waist,
    abdomen: a.abdomen,
    hips: a.hips,
    thighs: a.thighs,
    calves: a.calves,
    
    // Dobras (Mapeando do banco sf_ para o objeto TypeScript, se necessário, ou campos diretos)
    // O tipo Assessment no types.ts precisa refletir isso se formos usar na UI
    // Por enquanto, assumimos que o createAssessment está salvando e aqui estamos lendo o básico
    sf_chest: a.sf_chest,
    sf_axillary: a.sf_axillary,
    sf_triceps: a.sf_triceps,
    sf_subscapular: a.sf_subscapular,
    sf_abdominal: a.sf_abdominal,
    sf_suprailiac: a.sf_suprailiac,
    sf_thigh: a.sf_thigh,

    // IA
    strategicReport: a.strategic_report,
    motivationalReport: a.motivational_report
  }));
};

export const createAssessment = async (assessment: Assessment, trainerId: string): Promise<Assessment | null> => {
  const { data, error } = await supabase
    .from('assessments')
    .insert([
      {
        trainer_id: trainerId, // Vincula ao Treinador
        student_id: assessment.studentId,
        date: assessment.date,
        
        // Mapeando novos campos para snake_case do banco
        age: assessment.age,
        height: assessment.height,
        imc: assessment.imc,
        fat_method: assessment.fatCalculationMethod,
        tmb_method: assessment.tmbFormula,

        weight: assessment.weight,
        body_fat: assessment.bodyFat,
        muscle_mass: assessment.muscleMass,
        visceral_fat: assessment.visceralFat,
        metabolic_age: assessment.metabolicAge,
        
        chest: assessment.chest,
        arms: assessment.arms,
        waist: assessment.waist,
        abdomen: assessment.abdomen,
        hips: assessment.hips,
        thighs: assessment.thighs,
        calves: assessment.calves,

        // Dobras
        sf_chest: assessment.sf_chest,
        sf_axillary: assessment.sf_axillary,
        sf_triceps: assessment.sf_triceps,
        sf_subscapular: assessment.sf_subscapular,
        sf_abdominal: assessment.sf_abdominal,
        sf_suprailiac: assessment.sf_suprailiac,
        sf_thigh: assessment.sf_thigh,

        strategic_report: assessment.strategicReport,
        motivational_report: assessment.motivationalReport
      },
    ])
    .select()
    .single();

  if (error) {
    if (typeof window !== 'undefined') {
        alert(`Erro ao salvar avaliação: ${error.message} (${error.details || 'Verifique colunas no banco'})`);
    }
    console.error('Erro detalhado ao salvar avaliação:', error);
    return null;
  }

  return {
    ...assessment,
    id: data.id
  };
};