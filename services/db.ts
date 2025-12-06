
import { supabase } from './supabase';
import { Student, WorkoutPlan, PaymentStatus, Assessment } from '../types';

// --- ALUNOS ---

export const fetchStudents = async (): Promise<Student[]> => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
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

export const createStudent = async (student: Student): Promise<Student | null> => {
  const { data, error } = await supabase
    .from('students')
    .insert([
      {
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
    return false;
  }
  return true;
};

// --- TREINOS ---

export const fetchWorkouts = async (): Promise<WorkoutPlan[]> => {
  const { data, error } = await supabase
    .from('workouts')
    .select('*');

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

export const createWorkout = async (workout: WorkoutPlan): Promise<WorkoutPlan | null> => {
  const { data, error } = await supabase
    .from('workouts')
    .insert([
      {
        student_id: workout.studentId,
        title: workout.title,
        content: workout.sessions, 
        created_at: workout.createdAt
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Erro ao salvar treino:', error);
    return null;
  }

  return {
    ...workout,
    id: data.id
  };
};

// --- AVALIAÇÕES ---

export const fetchAssessments = async (studentId?: string): Promise<Assessment[]> => {
  let query = supabase.from('assessments').select('*').order('date', { ascending: false });
  
  if (studentId) {
    query = query.eq('student_id', studentId);
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
    weight: a.weight,
    bodyFat: a.body_fat,
    muscleMass: a.muscle_mass,
    visceralFat: a.visceral_fat,
    metabolicAge: a.metabolic_age,
    chest: a.chest,
    arms: a.arms,
    waist: a.waist,
    abdomen: a.abdomen,
    hips: a.hips,
    thighs: a.thighs,
    calves: a.calves,
    strategicReport: a.strategic_report,
    motivationalReport: a.motivational_report
  }));
};

export const createAssessment = async (assessment: Assessment): Promise<Assessment | null> => {
  const { data, error } = await supabase
    .from('assessments')
    .insert([
      {
        student_id: assessment.studentId,
        date: assessment.date,
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
        strategic_report: assessment.strategicReport,
        motivational_report: assessment.motivationalReport
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Erro ao salvar avaliação:', error);
    return null;
  }

  return {
    ...assessment,
    id: data.id
  };
};
