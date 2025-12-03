export enum PaymentStatus {
  PAID = 'Pago',
  LATE = 'Atrasado',
  PENDING = 'Pendente'
}

export type UserRole = 'TRAINER' | 'STUDENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  // Campos específicos de aluno
  studentId?: string; 
}

export interface Student {
  id: string;
  name: string;
  avatarUrl: string;
  status: PaymentStatus;
  goal: string;
  lastPaymentDate: string;
  email?: string; 
  password?: string; // Adicionado campo de senha
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string; // string to allow ranges like "10-12"
  weight: string;
  rest: string; // e.g., "60s"
  videoUrl?: string;
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  name: string; // e.g., "Treino A - Peito e Tríceps"
  exercises: Exercise[];
}

export interface WorkoutPlan {
  id: string;
  studentId: string;
  title: string; // e.g., "Hipertrofia Outubro"
  createdAt: string;
  sessions: WorkoutSession[];
}

export type ViewState = 'AUTH' | 'DASHBOARD' | 'STUDENTS' | 'WORKOUT_BUILDER' | 'FINANCE' | 'WORKOUT_VIEWER' | 'AI_CHAT';