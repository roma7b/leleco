import { supabase } from './supabase';
import { Student, WorkoutPlan, PaymentStatus, Assessment, AssessmentPhotos } from '../types';

// --- HELPER ---
const cleanNumber = (val: number | undefined | null) => {
    if (val === undefined || val === null || isNaN(val)) return null;
    return val;
}

// --- ALUNOS ---

export const fetchStudents = async (trainerId: string): Promise<Student[]> => {
  if (!trainerId) return [];

  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('trainer_id', trainerId) 
    .order('name');

  if (error) {
    console.error('Erro ao buscar alunos:', error);
    return [];
  }

  return data.map((s: any) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    avatarUrl: s.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=random&color=fff`,
    status: s.status as PaymentStatus,
    goal: s.goal,
    lastPaymentDate: s.last_payment_date,
    password: s.password,
    paymentLink: s.payment_link,
    dueDay: s.due_day
  }));
};

export const createStudent = async (student: Student, trainerId: string): Promise<Student | null> => {
  const { data, error } = await supabase
    .from('students')
    .insert([
      {
        trainer_id: trainerId, 
        name: student.name,
        email: student.email,
        avatar_url: student.avatarUrl,
        status: student.status,
        goal: student.goal,
        last_payment_date: student.lastPaymentDate,
        password: student.password,
        payment_link: student.paymentLink,
        due_day: student.dueDay || 10
      },
    ])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
        throw new Error(`O email "${student.email}" já está cadastrado.`);
    }
    console.error('Erro ao criar aluno:', error);
    throw error;
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
      email: student.email,
      payment_link: student.paymentLink,
      due_day: student.dueDay
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
    throw error;
  }
  return true;
};

// NOVA FUNÇÃO ESPECÍFICA PARA ATUALIZAÇÃO FINANCEIRA
export const updateStudentFinancials = async (studentId: string, status: string, paymentLink: string): Promise<boolean> => {
    const { error } = await supabase
        .from('students')
        .update({ 
            status: status,
            payment_link: paymentLink
        })
        .eq('id', studentId);

    if (error) {
        console.error('Erro ao atualizar financeiro:', error);
        throw error;
    }
    return true;
};

// --- TREINOS ---

export const fetchWorkouts = async (trainerId: string): Promise<WorkoutPlan[]> => {
  if (!trainerId) return [];

  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('trainer_id', trainerId); 

  if (error) {
    console.error('Erro ao buscar treinos:', error);
    return [];
  }

  return data.map((w: any) => ({
    id: w.id,
    studentId: w.student_id,
    title: w.title,
    createdAt: w.created_at,
    sessions: w.content 
  }));
};

export const createWorkout = async (workout: WorkoutPlan, trainerId: string): Promise<WorkoutPlan | null> => {
  const { data, error } = await supabase
    .from('workouts')
    .insert([
      {
        trainer_id: trainerId, 
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
    throw error;
  }

  return {
    ...workout,
    id: data.id
  };
};

// --- AVALIAÇÕES (Agora usando a tabela student_assessments) ---

export const fetchAssessments = async (studentId?: string, trainerId?: string): Promise<Assessment[]> => {
  // Apontando para a nova tabela para evitar cache antigo
  let query = supabase.from('student_assessments').select('*').order('date', { ascending: false });
  
  if (studentId) {
    query = query.eq('student_id', studentId);
  } 
  else if (trainerId) {
    query = query.eq('trainer_id', trainerId);
  } else {
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
    
    // Medidas Básicas
    chest: a.chest,
    waist: a.waist,
    abdomen: a.abdomen,
    hips: a.hips,

    // Medidas Bilaterais
    armRight: a.arm_right,
    armLeft: a.arm_left,
    thighRight: a.thigh_right,
    thighLeft: a.thigh_left,
    calfRight: a.calf_right,
    calfLeft: a.calf_left,
    
    // Dobras 
    sf_chest: a.sf_chest,
    sf_axillary: a.sf_axillary,
    sf_triceps: a.sf_triceps,
    sf_subscapular: a.sf_subscapular,
    sf_abdominal: a.sf_abdominal,
    sf_suprailiac: a.sf_suprailiac,
    sf_thigh: a.sf_thigh,

    photoUrls: a.photo_urls,
    strategicReport: a.strategic_report,
    motivationalReport: a.motivational_report
  }));
};

export const createAssessment = async (assessment: Assessment, trainerId: string): Promise<Assessment> => {
  const insertPayload = {
    trainer_id: trainerId, 
    student_id: assessment.studentId,
    date: assessment.date,
    
    age: cleanNumber(assessment.age),
    height: cleanNumber(assessment.height),
    imc: cleanNumber(assessment.imc),
    
    fat_method: assessment.fatCalculationMethod ?? 'Bioimpedância',
    tmb_method: assessment.tmbFormula ?? 'Mifflin-St Jeor',

    weight: assessment.weight || 0,
    body_fat: assessment.bodyFat || 0,
    muscle_mass: assessment.muscleMass || 0,
    visceral_fat: cleanNumber(assessment.visceralFat),
    metabolic_age: cleanNumber(assessment.metabolicAge),
    
    chest: cleanNumber(assessment.chest),
    waist: cleanNumber(assessment.waist),
    abdomen: cleanNumber(assessment.abdomen),
    hips: cleanNumber(assessment.hips),
    
    // Medidas Bilaterais Novas
    arm_right: cleanNumber(assessment.armRight),
    arm_left: cleanNumber(assessment.armLeft),
    thigh_right: cleanNumber(assessment.thighRight),
    thigh_left: cleanNumber(assessment.thighLeft),
    calf_right: cleanNumber(assessment.calfRight),
    calf_left: cleanNumber(assessment.calfLeft),
    
    sf_chest: cleanNumber(assessment.sf_chest),
    sf_axillary: cleanNumber(assessment.sf_axillary),
    sf_triceps: cleanNumber(assessment.sf_triceps),
    sf_subscapular: cleanNumber(assessment.sf_subscapular),
    sf_abdominal: cleanNumber(assessment.sf_abdominal),
    sf_suprailiac: cleanNumber(assessment.sf_suprailiac),
    sf_thigh: cleanNumber(assessment.sf_thigh),

    photo_urls: assessment.photoUrls || {},
    strategic_report: assessment.strategicReport || null,
    motivational_report: assessment.motivationalReport || null
  };

  // Apontando para a nova tabela
  const { data, error } = await supabase
    .from('student_assessments')
    .insert([insertPayload])
    .select()
    .single();

  if (error) {
    console.error('DB ERROR createAssessment:', error);
    throw new Error(`Erro Supabase: ${error.message}`); 
  }

  return {
    ...assessment,
    id: data.id
  };
};

export const updateAssessmentPhotos = async (assessmentId: string, photos: AssessmentPhotos): Promise<boolean> => {
    // Apontando para a nova tabela
    const { error } = await supabase
        .from('student_assessments')
        .update({ photo_urls: photos })
        .eq('id', assessmentId)
        .select('id'); 

    if (error) {
        console.error('DB Update Error:', error);
        throw error;
    }
    return true;
};
