
import React from 'react';
import { Users, Activity, AlertCircle, CheckSquare, ArrowRight, TrendingUp } from 'lucide-react';
import { MOCK_STUDENTS, MOCK_WORKOUTS } from '../services/mockData';
import { PaymentStatus, Student, WorkoutPlan } from '../types';

interface DashboardProps {
  onNavigate: (view: any) => void;
  students?: Student[];
  workouts?: WorkoutPlan[];
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, students = MOCK_STUDENTS, workouts = MOCK_WORKOUTS }) => {
  const currentStudents = students || MOCK_STUDENTS;
  const currentWorkouts = workouts || MOCK_WORKOUTS;
  
  const activeStudents = currentStudents.length;
  const latePayments = currentStudents.filter(s => s.status === PaymentStatus.LATE).length;
  const workoutsPrescribed = currentWorkouts.length; 

  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-gradient-to-r from-slate-900/50 to-transparent p-6 rounded-2xl border border-slate-800/50">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Olá, <span className="text-primary">Leleco</span></h1>
          <p className="text-slate-400 mt-1 text-sm md:text-base">Aqui está o resumo da sua performance hoje.</p>
        </div>
        <div className="hidden md:block text-right">
           <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Data de Hoje</div>
           <p className="text-white font-medium bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
             {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
           </p>
        </div>
      </header>

      {/* KPI Cards - Tablet Optimization: Grid 2 for MD, Grid 3 for LG */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-surface border border-slate-800 p-6 rounded-2xl shadow-lg hover:border-primary/50 transition-all relative overflow-hidden group h-40 flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:bg-primary/10"></div>
          
          <div className="flex items-center justify-between relative z-10">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-primary group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">+2 essa semana</span>
          </div>
          
          <div className="relative z-10">
             <h3 className="text-4xl font-bold text-white">{activeStudents}</h3>
             <p className="text-sm text-slate-400 font-medium">Alunos Ativos</p>
          </div>
        </div>

        <div className="bg-surface border border-slate-800 p-6 rounded-2xl shadow-lg hover:border-blue-500/50 transition-all relative overflow-hidden group h-40 flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:bg-blue-500/10"></div>
          
          <div className="flex items-center justify-between relative z-10">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-blue-400 group-hover:scale-110 transition-transform">
              <Activity size={24} />
            </div>
            <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded">Alta intensidade</span>
          </div>
          
          <div className="relative z-10">
             <h3 className="text-4xl font-bold text-white">{workoutsPrescribed}</h3>
             <p className="text-sm text-slate-400 font-medium">Treinos Prescritos</p>
          </div>
        </div>

        <div 
            className="bg-surface border border-slate-800 p-6 rounded-2xl shadow-lg hover:border-red-500/50 transition-all relative overflow-hidden group h-40 flex flex-col justify-between cursor-pointer md:col-span-2 lg:col-span-1" 
            onClick={() => onNavigate('FINANCE')}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:bg-red-500/10"></div>
          
          <div className="flex items-center justify-between relative z-10">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-red-500 group-hover:text-red-400 group-hover:scale-110 transition-transform">
              <AlertCircle size={24} />
            </div>
            {latePayments > 0 && (
                <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded uppercase animate-pulse">Ação Necessária</span>
            )}
          </div>
          
          <div className="relative z-10">
             <h3 className="text-4xl font-bold text-white">{latePayments}</h3>
             <p className="text-sm text-slate-400 font-medium">Mensalidades Pendentes</p>
          </div>
        </div>
      </div>

      {/* Quick Tasks - Responsive Grid */}
      <div className="bg-surface border border-slate-800 rounded-2xl p-6 md:p-8 shadow-lg">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <div className="p-2 bg-slate-900 rounded-lg border border-slate-800"><CheckSquare className="text-primary" size={20} /></div>
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <button 
            onClick={() => onNavigate('WORKOUT_BUILDER')}
            className="flex flex-col items-start justify-between p-6 bg-gradient-to-br from-slate-900 to-slate-900/50 hover:from-slate-800 hover:to-slate-900 border border-slate-800 hover:border-primary/50 rounded-2xl transition-all group h-40 relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 w-20 h-20 bg-white/5 rounded-bl-full -mr-10 -mt-10 transition-all group-hover:bg-primary/10"></div>
            <span className="text-lg font-bold text-slate-200 group-hover:text-white relative z-10">Criar Nova Ficha</span>
            <div className="w-full flex justify-between items-end relative z-10">
               <span className="text-xs text-slate-500">Prescrição de treino</span>
               <div className="bg-slate-950 p-2 rounded-full border border-slate-800 group-hover:border-primary group-hover:text-primary transition-colors">
                 <ArrowRight size={20} className="transform group-hover:translate-x-1 transition-transform" />
               </div>
            </div>
          </button>
          
          <button 
            onClick={() => onNavigate('FINANCE')}
            className="flex flex-col items-start justify-between p-6 bg-gradient-to-br from-slate-900 to-slate-900/50 hover:from-slate-800 hover:to-slate-900 border border-slate-800 hover:border-primary/50 rounded-2xl transition-all group h-40 relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 w-20 h-20 bg-white/5 rounded-bl-full -mr-10 -mt-10 transition-all group-hover:bg-primary/10"></div>
            <span className="text-lg font-bold text-slate-200 group-hover:text-white relative z-10">Verificar Pagamentos</span>
             <div className="w-full flex justify-between items-end relative z-10">
               <span className="text-xs text-slate-500">Gestão financeira</span>
               <div className="bg-slate-950 p-2 rounded-full border border-slate-800 group-hover:border-primary group-hover:text-primary transition-colors">
                 <ArrowRight size={20} className="transform group-hover:translate-x-1 transition-transform" />
               </div>
            </div>
          </button>
          
          <button 
            onClick={() => onNavigate('STUDENTS')}
            className="flex flex-col items-start justify-between p-6 bg-gradient-to-br from-slate-900 to-slate-900/50 hover:from-slate-800 hover:to-slate-900 border border-slate-800 hover:border-primary/50 rounded-2xl transition-all group h-40 relative overflow-hidden md:col-span-2 lg:col-span-1"
          >
            <div className="absolute right-0 top-0 w-20 h-20 bg-white/5 rounded-bl-full -mr-10 -mt-10 transition-all group-hover:bg-primary/10"></div>
            <span className="text-lg font-bold text-slate-200 group-hover:text-white relative z-10">Gerenciar Alunos</span>
             <div className="w-full flex justify-between items-end relative z-10">
               <span className="text-xs text-slate-500">CRM Completo</span>
               <div className="bg-slate-950 p-2 rounded-full border border-slate-800 group-hover:border-primary group-hover:text-primary transition-colors">
                 <ArrowRight size={20} className="transform group-hover:translate-x-1 transition-transform" />
               </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
