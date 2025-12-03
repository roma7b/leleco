
import { supabase } from './supabase';
import { Student, WorkoutPlan, PaymentStatus } from '../types';

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
        password: student.password, // Salvando a senha
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
    id: data.id, // Atualiza com o ID real do banco
  };
};

export const updateStudent = async (student: Student): Promise<boolean> => {
  // Prepara o objeto de atualização
  const updateData: any = {
      status: student.status,
      goal: student.goal,
      last_payment_date: student.lastPaymentDate,
      name: student.name,
      email: student.email
  };

  // Só atualiza a senha se ela foi fornecida (string não vazia)
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
        content: workout.sessions, // Salvando o array de sessões como JSON
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
